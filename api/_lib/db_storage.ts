import { type AdminUser, type InsertAdminUser, stores, adminUsers, type Store as DbStore, type InsertStore } from "../../shared/schema.js";
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { eq, desc, count } from "drizzle-orm";
import crypto from "crypto";
import { config } from "./config.js";

// --- SUPABASE STORAGE UTILS ---
// Custom uploader substituting @supabase/supabase-js to bypass local npm cache blockers
async function uploadBase64ToStorage(base64String: string, imageId: string): Promise<string | null> {
  // If it's already a URL, return it
  if (base64String.startsWith('http')) return base64String;

  // Basic validation that it's a data URI
  const match = base64String.match(/^data:image\/(png|jpeg|webp|jpg);base64,(.+)$/);
  if (!match) return null;

  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, "base64");

  const filename = `${imageId}-${crypto.randomBytes(4).toString('hex')}.${ext}`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("❌ [Storage] Missing Supabase URL or Key for upload");
    return null; // Fallback gracefully if env is broken, though UI might miss images
  }

  // Supabase Storage REST API Endpoint
  const url = `${supabaseUrl}/storage/v1/object/store-images/${filename}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": `image/${match[1]}`, // Critical for browser to render
        "Cache-Control": "3600",
        "x-upsert": "false" // Don't overwrite existing
      },
      body: buffer
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Storage] Upload failed: ${response.status}`, errorText);
      return null;
    }

    // Return the public URL
    return `${supabaseUrl}/storage/v1/object/public/store-images/${filename}`;
  } catch (err) {
    console.error(`❌ [Storage] Exception during upload:`, err);
    return null;
  }
}
// ------------------------------

// Define the shape of our Store object for the application
export interface Store {
  id: string; // UUID from database
  name: string;
  description: string;
  products: string[];
  address: string;
  city: string;
  province: string;
  latitude: string;
  longitude: string;
  category: "food" | "clothes" | "other" | "retail";
  website?: string | null;
  image?: string | null;
  images?: string[] | null;
  email?: string | null;
  status: "approved" | "pending" | "rejected";
  createdAt: Date;
}

// EGRESS OPTIMIZATION: Lean store type for map pins — excludes heavy fields (description, email)
// Now includes image + images so real store photos display instead of placeholders
export interface StoreLean {
  id: string;
  name: string;
  products: string[];
  address: string;
  city: string;
  province: string;
  latitude: string;
  longitude: string;
  category: "food" | "clothes" | "other" | "retail";
  status: "approved" | "pending" | "rejected";
  createdAt: Date;
}

export interface IStorage {
  // Store methods
  getAllStores(limit?: number, offset?: number): Promise<Store[]>;
  getApprovedStores(): Promise<Store[]>;
  getApprovedStoresLean(): Promise<StoreLean[]>; // EGRESS OPT: Lean query for public map pins
  getStoreCount(): Promise<number>; // EGRESS OPT: Count without fetching rows
  getStore(id: string): Promise<Store | undefined>;
  getStoreImages(id: string): Promise<{ image: string | null; images: string[] | null } | undefined>; // NEW OPT: Fetch heavy images lazily
  createStore(store: InsertStore): Promise<Store>;
  updateStoreStatus(id: string, status: "approved" | "rejected" | "pending"): Promise<Store | undefined>;
  updateStoreImages(id: string, images: string[]): Promise<Store | undefined>;
  updateStore(id: string, updates: Partial<InsertStore>): Promise<Store | undefined>;
  deleteStore(id: string): Promise<boolean>;

  // Admin User methods
  getAdminUser(id: number): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  updateAdminPassword(id: number, passwordHash: string): Promise<boolean>;
  deleteAdminUser(id: number): Promise<boolean>;
  getAllAdminUsers(): Promise<AdminUser[]>;

  // Rate Limiting
  checkLoginLockout(ip: string, username: string): Promise<boolean>;
  recordLoginAttempt(ip: string, username: string, success: boolean): Promise<void>;
}

// Changes made here for standard Postgres storage (Supabase/Neon/etc).
// Map pins are served directly from this DB (getApprovedStores) to minimize external API calls.
export class DatabaseStorage implements IStorage {
  private db;
  private pool;

  // EGRESS OPTIMIZATION: In-memory cache for approved stores (avoids repeated DB queries)
  // TTL: 5 minutes — dramatically reduces Supabase egress on free plan
  private approvedStoresCache: { data: StoreLean[] | null; timestamp: number } = { data: null, timestamp: 0 };
  private readonly CACHE_TTL_MS = 300_000; // 5 minutes — reduces repeated DB egress

  constructor() {
    // Validate config implicitly by accessing it
    if (!config.databaseUrl) {
      throw new Error("Configuration Error: Missing database credentials");
    }

    // Use standard node-postgres pool for compatibility with Supabase (Transaction Pooler) and Neon
    this.pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: { rejectUnauthorized: false }, // Required for valid Supabase/Vercel connections
    });

    this.db = drizzle(this.pool);
    console.log("✅ DatabaseStorage initialized with node-postgres driver");
  }

  // EGRESS OPTIMIZATION: Invalidate cache when stores are modified
  private invalidateCache() {
    this.approvedStoresCache = { data: null, timestamp: 0 };
  }

  private async getApprovedStoresLeanFromSupabase(): Promise<StoreLean[]> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !serviceKey) {
      throw new Error("Supabase REST fallback unavailable: missing URL or API key");
    }

    const query = new URLSearchParams({
      select: "id,name,products,address,city,province,latitude,longitude,category,status,created_at",
      status: "eq.approved",
      order: "created_at.desc",
    });

    const response = await fetch(`${supabaseUrl}/rest/v1/stores?${query.toString()}`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase REST fallback failed: ${response.status} ${errorText}`);
    }

    const stores = await response.json() as Array<{
      id: string;
      name: string;
      products: string[] | null;
      address: string;
      city: string;
      province: string;
      latitude: string;
      longitude: string;
      category: string;
      status: string;
      created_at: string | null;
    }>;

    return stores.map((store) => ({
      id: store.id,
      name: store.name,
      products: Array.isArray(store.products) ? store.products : [],
      address: store.address,
      city: store.city,
      province: store.province,
      latitude: store.latitude,
      longitude: store.longitude,
      category: store.category as "food" | "clothes" | "other" | "retail",
      status: store.status as "approved" | "pending" | "rejected",
      createdAt: store.created_at ? new Date(store.created_at) : new Date(),
    }));
  }

  // --- Store Methods ---

  // EGRESS OPTIMIZATION: Added pagination support (limit/offset) for admin lists
  async getAllStores(limit = 500, offset = 0): Promise<Store[]> {
    const allStores = await this.db.select().from(stores)
      .limit(limit)
      .offset(offset);
    console.log(`📊 Fetched ${allStores.length} stores (limit=${limit}, offset=${offset}).`);
    return allStores.map(this.mapToStore);
  }

  async getApprovedStores(): Promise<Store[]> {
    const approvedStores = await this.db.select().from(stores)
      .where(eq(stores.status, "approved"))
      .orderBy(desc(stores.createdAt));
    return approvedStores.map(this.mapToStore);
  }

  // EGRESS OPTIMIZATION: Lean query — excludes description and email only
  // Includes image/images so real store photos display. Cached for 5 minutes.
  async getApprovedStoresLean(): Promise<StoreLean[]> {
    const now = Date.now();
    // Return cached data if still fresh
    if (this.approvedStoresCache.data && (now - this.approvedStoresCache.timestamp) < this.CACHE_TTL_MS) {
      return this.approvedStoresCache.data;
    }

    let result: StoreLean[];

    try {
      const leanStores = await this.db.select({
        id: stores.id,
        name: stores.name,
        products: stores.products,
        address: stores.address,
        city: stores.city,
        province: stores.province,
        latitude: stores.latitude,
        longitude: stores.longitude,
        category: stores.category,
        status: stores.status,
        createdAt: stores.createdAt,
      }).from(stores)
        .where(eq(stores.status, "approved"))
        .orderBy(desc(stores.createdAt));

      result = leanStores.map(s => ({
        ...s,
        category: s.category as "food" | "clothes" | "other" | "retail",
        status: s.status as "approved" | "pending" | "rejected",
        createdAt: s.createdAt || new Date(),
      }));
    } catch (dbError) {
      console.warn("⚠️ [DB] Direct Postgres query failed; using Supabase REST fallback for approved stores.", dbError);
      result = await this.getApprovedStoresLeanFromSupabase();
    }

    // Update cache
    this.approvedStoresCache = { data: result, timestamp: now };
    return result;
  }

  // EGRESS OPTIMIZATION: Count query returns only a number — no row data transferred
  async getStoreCount(): Promise<number> {
    const result = await this.db.select({ count: count() }).from(stores)
      .where(eq(stores.status, "approved"));
    return result[0]?.count ?? 0;
  }

  async getStore(id: string): Promise<Store | undefined> {
    const result = await this.db.select().from(stores).where(eq(stores.id, id));
    return result.length > 0 ? this.mapToStore(result[0]) : undefined;
  }

  // EGRESS OPTIMIZATION: Heavy payload fetching specific store's base64 strings only when clicked
  async getStoreImages(id: string): Promise<{ image: string | null; images: string[] | null } | undefined> {
    const result = await this.db.select({
      image: stores.image,
      images: stores.images,
    }).from(stores).where(eq(stores.id, id));

    return result.length > 0 ? result[0] : undefined;
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const storeId = crypto.randomUUID();

    let uploadedImage: string | null = null;
    let uploadedImages: string[] = [];

    // Migrate Primary Image Data URI to URL
    if (insertStore.image && insertStore.image.startsWith('data:image')) {
      uploadedImage = await uploadBase64ToStorage(insertStore.image, `primary-${storeId}`);
    }

    // Migrate Array Images
    if (insertStore.images && insertStore.images.length > 0) {
      for (let i = 0; i < insertStore.images.length; i++) {
        const imgData = insertStore.images[i];
        if (imgData.startsWith('data:image')) {
          const url = await uploadBase64ToStorage(imgData, `gallery-${storeId}-${i}`);
          if (url) uploadedImages.push(url);
        } else {
          uploadedImages.push(imgData); // Keep if already a URL
        }
      }
    }

    const newStore = {
      ...insertStore,
      id: storeId,
      image: uploadedImage || insertStore.image, // Fallback to raw if upload failed (though ideally we just drop it)
      images: uploadedImages.length > 0 ? uploadedImages : insertStore.images,
    };

    const result = await this.db.insert(stores).values(newStore).returning();
    this.invalidateCache(); // EGRESS OPT: Bust cache on mutation
    return this.mapToStore(result[0]);
  }

  async updateStoreStatus(id: string, status: "approved" | "rejected" | "pending"): Promise<Store | undefined> {
    const result = await this.db.update(stores).set({ status }).where(eq(stores.id, id)).returning();
    this.invalidateCache(); // EGRESS OPT: Bust cache on status change
    return result.length > 0 ? this.mapToStore(result[0]) : undefined;
  }

  async updateStoreImages(id: string, images: string[]): Promise<Store | undefined> {
    let uploadedImages: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const imgData = images[i];
      if (imgData.startsWith('data:image')) {
        const url = await uploadBase64ToStorage(imgData, `gallery-${id}-${i}`);
        if (url) uploadedImages.push(url);
      } else {
        uploadedImages.push(imgData);
      }
    }

    const result = await this.db.update(stores).set({ images: uploadedImages }).where(eq(stores.id, id)).returning();
    this.invalidateCache(); // EGRESS OPT: Bust cache on image update
    return result.length > 0 ? this.mapToStore(result[0]) : undefined;
  }

  async updateStore(id: string, updates: Partial<DbStore>): Promise<Store | undefined> {
    const result = await this.db.update(stores).set(updates).where(eq(stores.id, id)).returning();
    this.invalidateCache(); // EGRESS OPT: Bust cache on update
    return result.length > 0 ? this.mapToStore(result[0]) : undefined;
  }

  async deleteStore(id: string): Promise<boolean> {
    const result = await this.db.delete(stores).where(eq(stores.id, id)).returning();
    this.invalidateCache(); // EGRESS OPT: Bust cache on delete
    return result.length > 0;
  }

  // Helper to map DB result to application Store interface
  private mapToStore(dbStore: DbStore): Store {
    return {
      ...dbStore,
      // Ensure category is typed correctly
      category: dbStore.category as "food" | "clothes" | "other" | "retail",
      status: dbStore.status as "approved" | "pending" | "rejected",
      createdAt: dbStore.createdAt || new Date(),
    };
  }

  // --- Admin User Methods ---

  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    const result = await this.db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const result = await this.db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const result = await this.db.insert(adminUsers).values(user).returning();
    return result[0];
  }

  async updateAdminPassword(id: number, passwordHash: string): Promise<boolean> {
    const result = await this.db.update(adminUsers).set({ passwordHash }).where(eq(adminUsers.id, id)).returning();
    return result.length > 0;
  }

  async deleteAdminUser(id: number): Promise<boolean> {
    const result = await this.db.delete(adminUsers).where(eq(adminUsers.id, id)).returning();
    return result.length > 0;
  }

  // EGRESS OPTIMIZATION: Select only needed admin columns (excludes passwordHash from query)
  async getAllAdminUsers(): Promise<AdminUser[]> {
    return await this.db.select({
      id: adminUsers.id,
      username: adminUsers.username,
      passwordHash: adminUsers.passwordHash,
      createdAt: adminUsers.createdAt,
    }).from(adminUsers);
  }

  // --- LOGIN LOCKOUT ---

  async checkLoginLockout(ip: string, rawUsername: string): Promise<boolean> {
    const username = rawUsername.trim().toLowerCase().substring(0, 100);
    try {
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

      // Check IP
      const ipQuery = `
        SELECT COUNT(*) as count 
        FROM admin_login_attempts 
        WHERE ip_address = $1 AND success = false AND attempted_at > $2
      `;
      const ipRes = await this.pool.query(ipQuery, [ip, fifteenMinsAgo]);
      const ipFailures = parseInt(ipRes.rows[0].count, 10);

      // Check Username
      const userQuery = `
        SELECT COUNT(*) as count 
        FROM admin_login_attempts 
        WHERE username = $1 AND success = false AND attempted_at > $2
      `;
      const userRes = await this.pool.query(userQuery, [username, fifteenMinsAgo]);
      const userFailures = parseInt(userRes.rows[0].count, 10);

      return ipFailures >= 5 || userFailures >= 10;
    } catch (e: any) {
      if (e.code === '42P01') {
        // Table doesn't exist yet, safe to proceed
        console.warn("[db_storage] admin_login_attempts table not found, skipping lockout check");
        return false; 
      }
      console.error("Error checking login lockout:", e);
      // Fail closed
      return true;
    }
  }

  async recordLoginAttempt(ip: string, rawUsername: string, success: boolean): Promise<void> {
    const username = rawUsername.trim().toLowerCase().substring(0, 100);
    try {
      const insertQuery = `
        INSERT INTO admin_login_attempts (ip_address, username, success)
        VALUES ($1, $2, $3)
      `;
      await this.pool.query(insertQuery, [ip, username, success]);

      // Cleanup rows older than 7 days asynchronously
      const cleanupQuery = `
        DELETE FROM admin_login_attempts
        WHERE attempted_at < NOW() - INTERVAL '7 days'
      `;
      // We don't await this to avoid slowing down the login response
      this.pool.query(cleanupQuery).catch((e: any) => {
          if (e.code !== '42P01') {
              console.error("Error cleaning up admin_login_attempts:", e);
          }
      });
    } catch (e: any) {
      if (e.code === '42P01') {
        return; // Table not created yet
      }
      console.error("Error recording login attempt:", e);
    }
  }
}



export const storage = new DatabaseStorage();
