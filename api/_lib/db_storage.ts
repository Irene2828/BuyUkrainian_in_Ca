import { type AdminUser, type InsertAdminUser, type Store, type InsertStore, stores, adminUsers } from "../../shared/schema.js";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc } from "drizzle-orm";

// IStorage Interface
export interface IStorage {
  // Admin user methods
  getAdminUser(id: number): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  getAllAdminUsers(): Promise<AdminUser[]>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  deleteAdminUser(id: number): Promise<boolean>;
  updateAdminPassword(id: number, passwordHash: string): Promise<AdminUser | undefined>;

  // Store methods
  getAllStores(): Promise<Store[]>;
  getApprovedStores(): Promise<Store[]>;
  getPendingStores(): Promise<Store[]>;
  getStore(id: string): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStoreStatus(id: string, status: "pending" | "approved" | "rejected"): Promise<Store | undefined>;
  updateStoreImages(id: string, images: string[]): Promise<Store | undefined>;
  updateStore(id: string, updates: { name?: string; address?: string }): Promise<Store | undefined>;
  deleteStore(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is missing. Ensure the database is provisioned.");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
    console.log("✅ DatabaseStorage initialized with Neon HTTP driver");
  }

  // Admin User Methods
  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    const [user] = await this.db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user;
  }
  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [user] = await this.db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return user;
  }
  async getAllAdminUsers(): Promise<AdminUser[]> {
    return await this.db.select().from(adminUsers);
  }
  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const [newUser] = await this.db.insert(adminUsers).values(user).returning();
    return newUser;
  }
  async deleteAdminUser(id: number): Promise<boolean> {
    const [deleted] = await this.db.delete(adminUsers).where(eq(adminUsers.id, id)).returning();
    return !!deleted;
  }
  async updateAdminPassword(id: number, passwordHash: string): Promise<AdminUser | undefined> {
    const [updated] = await this.db.update(adminUsers)
      .set({ passwordHash })
      .where(eq(adminUsers.id, id))
      .returning();
    return updated;
  }

  // Store Methods
  async getAllStores(): Promise<Store[]> {
    const allStores = await this.db.select().from(stores);
    console.log(`📊 Fetched ${allStores.length} stores from the database.`);
    return allStores;
  }
  async getApprovedStores(): Promise<Store[]> {
    return await this.db.select().from(stores)
      .where(eq(stores.status, "approved"))
      .orderBy(desc(stores.approvedAt));
  }
  async getPendingStores(): Promise<Store[]> {
    return await this.db.select().from(stores).where(eq(stores.status, "pending"));
  }
  async getStore(id: string): Promise<Store | undefined> {
    const [store] = await this.db.select().from(stores).where(eq(stores.id, id));
    return store;
  }
  async createStore(insertStore: InsertStore): Promise<Store> {
    const [store] = await this.db.insert(stores).values({
      ...insertStore,
      id: crypto.randomUUID(), // Ensure UUIDs are generated
      images: insertStore.images || [],
      image: insertStore.image || null,
      email: insertStore.email || null,
      website: insertStore.website || null,
      status: insertStore.status || "pending",
      // isOpen is defaulted in schema but good to be explicit if needed, however schema handles default logic usually.
      // Drizzle insert should respect schema defaults if column is omitted or set to undefined logic
    }).returning();
    return store;
  }
  async updateStoreStatus(id: string, status: "pending" | "approved" | "rejected"): Promise<Store | undefined> {
    const updates: any = { status };
    if (status === "approved") {
      updates.approvedAt = new Date();
    }
    const [store] = await this.db.update(stores).set(updates).where(eq(stores.id, id)).returning();
    return store;
  }
  async updateStoreImages(id: string, images: string[]): Promise<Store | undefined> {
    const image = images.length > 0 ? images[0] : null;
    const [store] = await this.db.update(stores).set({ images, image }).where(eq(stores.id, id)).returning();
    return store;
  }
  async updateStore(id: string, updates: { name?: string; address?: string }): Promise<Store | undefined> {
    const [store] = await this.db.update(stores).set(updates).where(eq(stores.id, id)).returning();
    return store;
  }
  async deleteStore(id: string): Promise<boolean> {
    const [deleted] = await this.db.delete(stores).where(eq(stores.id, id)).returning();
    return !!deleted;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, AdminUser> = new Map();
  private stores: Map<string, Store> = new Map();
  private currentUserId = 1;

  constructor() {
    console.log("ℹ️  Using MemStorage (No Database Connection)");
  }

  async getAdminUser(id: number) { return this.users.get(id); }
  async getAdminUserByUsername(username: string) { return Array.from(this.users.values()).find(u => u.username === username); }
  async getAllAdminUsers() { return Array.from(this.users.values()); }
  async createAdminUser(user: InsertAdminUser) {
    const id = this.currentUserId++;
    const newUser = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }
  async deleteAdminUser(id: number) { return this.users.delete(id); }
  async updateAdminPassword(id: number, hash: string) {
    const u = this.users.get(id); if (!u) return undefined;
    const nu = { ...u, passwordHash: hash }; this.users.set(id, nu); return nu;
  }

  async getAllStores() { return Array.from(this.stores.values()); }
  async getApprovedStores() { return Array.from(this.stores.values()).filter(s => s.status === "approved").sort((a, b) => (b.approvedAt?.getTime() || 0) - (a.approvedAt?.getTime() || 0)); }
  async getPendingStores() { return Array.from(this.stores.values()).filter(s => s.status === "pending"); }
  async getStore(id: string) { return this.stores.get(id); }
  async createStore(insertStore: InsertStore) {
    const id = crypto.randomUUID();
    const now = new Date();
    const store: Store = {
      ...insertStore,
      id,
      createdAt: now,
      status: insertStore.status || "pending",
      images: insertStore.images || [],
      image: insertStore.image || null,
      email: insertStore.email || null,
      website: insertStore.website || null,
      approvedAt: insertStore.status === "approved" ? now : null,
      isOpen: "true",
      latitude: insertStore.latitude,
      longitude: insertStore.longitude
    };
    this.stores.set(id, store);
    return store;
  }
  async updateStoreStatus(id: string, status: "pending" | "approved" | "rejected") {
    const s = this.stores.get(id); if (!s) return undefined;
    const u = { ...s, status, approvedAt: status === "approved" ? new Date() : s.approvedAt };
    this.stores.set(id, u); return u;
  }
  async updateStoreImages(id: string, images: string[]) {
    const s = this.stores.get(id); if (!s) return undefined;
    const u = { ...s, images, image: images[0] || null };
    this.stores.set(id, u); return u;
  }
  async updateStore(id: string, updates: any) {
    const s = this.stores.get(id); if (!s) return undefined;
    const u = { ...s, ...updates }; this.stores.set(id, u); return u;
  }
  async deleteStore(id: string) { return this.stores.delete(id); }
}

let storageImplementation: IStorage;

try {
  if (process.env.DATABASE_URL) {
    storageImplementation = new DatabaseStorage();
  } else {
    console.warn("⚠️  WARNING: DATABASE_URL is missing. Falling back to empty MemStorage.");
    storageImplementation = new MemStorage();
  }
} catch (error) {
  console.error("❌ Failed to initialize DatabaseStorage:", error);
  storageImplementation = new MemStorage();
}

export const storage = storageImplementation;
