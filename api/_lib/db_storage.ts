import { type AdminUser, type InsertAdminUser, stores, adminUsers, type Store as DbStore, type InsertStore } from "../../shared/schema.js";
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { eq } from "drizzle-orm";

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

export interface IStorage {
  // Store methods
  getAllStores(): Promise<Store[]>;
  getApprovedStores(): Promise<Store[]>; // Map pins fetched here
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

// Changes made here for standard Postgres storage (Supabase/Neon/etc).
// Map pins are served directly from this DB (getApprovedStores) to minimize external API calls.
export class DatabaseStorage implements IStorage {
  private db;
  private pool;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set. The application requires a database connection.");
    }

    // Use standard node-postgres pool for compatibility with Supabase (Transaction Pooler) and Neon
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.db = drizzle(this.pool);
    console.log("✅ DatabaseStorage initialized with node-postgres driver");
  }

  // --- Store Methods ---

  async getAllStores(): Promise<Store[]> {
    const allStores = await this.db.select().from(stores);
    console.log(`📊 Fetched ${allStores.length} stores from the database.`);
    return allStores.map(this.mapToStore);
  }

  async getApprovedStores(): Promise<Store[]> {
    const approvedStores = await this.db.select().from(stores).where(eq(stores.status, "approved"));
    return approvedStores.map(this.mapToStore);
  }

  async getStore(id: string): Promise<Store | undefined> {
    const result = await this.db.select().from(stores).where(eq(stores.id, id));
    return result.length > 0 ? this.mapToStore(result[0]) : undefined;
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const result = await this.db.insert(stores).values(insertStore).returning();
    return this.mapToStore(result[0]);
  }

  async updateStoreStatus(id: string, status: "approved" | "rejected" | "pending"): Promise<Store | undefined> {
    const result = await this.db.update(stores).set({ status }).where(eq(stores.id, id)).returning();
    return result.length > 0 ? this.mapToStore(result[0]) : undefined;
  }

  async updateStoreImages(id: string, images: string[]): Promise<Store | undefined> {
    const result = await this.db.update(stores).set({ images }).where(eq(stores.id, id)).returning();
    return result.length > 0 ? this.mapToStore(result[0]) : undefined;
  }

  async updateStore(id: string, updates: Partial<InsertStore>): Promise<Store | undefined> {
    const result = await this.db.update(stores).set(updates).where(eq(stores.id, id)).returning();
    return result.length > 0 ? this.mapToStore(result[0]) : undefined;
  }

  async deleteStore(id: string): Promise<boolean> {
    const result = await this.db.delete(stores).where(eq(stores.id, id)).returning();
    return result.length > 0;
  }

  // Helper to map DB result to application Store interface
  private mapToStore(dbStore: DbStore): Store {
    return {
      ...dbStore,
      // Ensure category is typed correctly
      category: dbStore.category as "food" | "clothes" | "other" | "retail",
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

  async getAllAdminUsers(): Promise<AdminUser[]> {
    return await this.db.select().from(adminUsers);
  }
}

// Strict enforcement: no fallback
if (!process.env.DATABASE_URL) {
  console.error("❌ CRITICAL: DATABASE_URL is missing from environment variables.");
  console.error("The application requires a database connection to function.");
  throw new Error("Missing DATABASE_URL");
}

export const storage = new DatabaseStorage();
