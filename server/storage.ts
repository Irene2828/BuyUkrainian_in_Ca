import { type AdminUser, type InsertAdminUser, type Store, type InsertStore, stores, adminUsers } from "@shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

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
  getStore(id: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStoreStatus(id: number, status: "pending" | "approved" | "rejected"): Promise<Store | undefined>;
  updateStoreImage(id: number, image: string | null): Promise<Store | undefined>;
  deleteStore(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Admin user methods
  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    const result = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return result[0];
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const result = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return result[0];
  }

  async getAllAdminUsers(): Promise<AdminUser[]> {
    return await db.select().from(adminUsers);
  }

  async createAdminUser(insertUser: InsertAdminUser): Promise<AdminUser> {
    const result = await db.insert(adminUsers).values(insertUser).returning();
    return result[0];
  }

  async deleteAdminUser(id: number): Promise<boolean> {
    const result = await db.delete(adminUsers).where(eq(adminUsers.id, id)).returning();
    return result.length > 0;
  }

  async updateAdminPassword(id: number, passwordHash: string): Promise<AdminUser | undefined> {
    const result = await db.update(adminUsers)
      .set({ passwordHash })
      .where(eq(adminUsers.id, id))
      .returning();
    return result[0];
  }

  // Store methods
  async getAllStores(): Promise<Store[]> {
    return await db.select().from(stores);
  }

  async getApprovedStores(): Promise<Store[]> {
    return await db.select().from(stores).where(eq(stores.status, "approved"));
  }

  async getPendingStores(): Promise<Store[]> {
    return await db.select().from(stores).where(eq(stores.status, "pending"));
  }

  async getStore(id: number): Promise<Store | undefined> {
    const result = await db.select().from(stores).where(eq(stores.id, id));
    return result[0];
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const result = await db.insert(stores).values(insertStore).returning();
    return result[0];
  }

  async updateStoreStatus(id: number, status: "pending" | "approved" | "rejected"): Promise<Store | undefined> {
    const result = await db.update(stores)
      .set({ status })
      .where(eq(stores.id, id))
      .returning();
    return result[0];
  }

  async updateStoreImage(id: number, image: string | null): Promise<Store | undefined> {
    const result = await db.update(stores)
      .set({ image })
      .where(eq(stores.id, id))
      .returning();
    return result[0];
  }

  async deleteStore(id: number): Promise<boolean> {
    const result = await db.delete(stores).where(eq(stores.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
