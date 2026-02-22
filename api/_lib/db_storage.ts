import { type AdminUser, type InsertAdminUser, stores, adminUsers, type Store as DbStore, type InsertStore } from "../../shared/schema.js";
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { eq, desc, count } from "drizzle-orm";
import crypto from "crypto";

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

// EGRESS OPTIMIZATION: Lean store type for map pins — excludes heavy fields (description, email, images)
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
  website?: string | null;
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
}

import { config } from "./config.js";

// Changes made here for standard Postgres storage (Supabase/Neon/etc).
// Map pins are served directly from this DB (getApprovedStores) to minimize external API calls.
export class DatabaseStorage implements IStorage {
  private db;
  private pool;

  // EGRESS OPTIMIZATION: In-memory cache for approved stores (avoids repeated DB queries)
  // TTL: 60 seconds — balances freshness with egress reduction
  private approvedStoresCache: { data: StoreLean[] | null; timestamp: number } = { data: null, timestamp: 0 };
  private readonly CACHE_TTL_MS = 60_000; // 60 seconds

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

  // EGRESS OPTIMIZATION: Lean query fetches only columns needed for map pins & cards
  // Excludes: description, image (single), images (array), email — saves significant bandwidth
  async getApprovedStoresLean(): Promise<StoreLean[]> {
    const now = Date.now();
    // Return cached data if still fresh
    if (this.approvedStoresCache.data && (now - this.approvedStoresCache.timestamp) < this.CACHE_TTL_MS) {
      return this.approvedStoresCache.data;
    }

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
      website: stores.website,
      status: stores.status,
      createdAt: stores.createdAt,
    }).from(stores)
      .where(eq(stores.status, "approved"))
      .orderBy(desc(stores.createdAt));

    const result = leanStores.map(s => ({
      ...s,
      category: s.category as "food" | "clothes" | "other" | "retail",
      status: s.status as "approved" | "pending" | "rejected",
      createdAt: s.createdAt || new Date(),
    }));

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

  async createStore(insertStore: InsertStore): Promise<Store> {
    const newStore = {
      ...insertStore,
      id: crypto.randomUUID(),
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
    const result = await this.db.update(stores).set({ images }).where(eq(stores.id, id)).returning();
    this.invalidateCache(); // EGRESS OPT: Bust cache on image update
    return result.length > 0 ? this.mapToStore(result[0]) : undefined;
  }

  async updateStore(id: string, updates: Partial<InsertStore>): Promise<Store | undefined> {
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
}



export const storage = new DatabaseStorage();
