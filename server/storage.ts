import { type User, type InsertUser, type Store, type InsertStore, stores } from "@shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods (existing)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Store methods
  getAllStores(): Promise<Store[]>;
  getApprovedStores(): Promise<Store[]>;
  getPendingStores(): Promise<Store[]>;
  getStore(id: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStoreStatus(id: number, status: "pending" | "approved" | "rejected"): Promise<Store | undefined>;
  deleteStore(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    // Placeholder - implement when user auth is needed
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Placeholder - implement when user auth is needed
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Placeholder - implement when user auth is needed
    throw new Error("Not implemented");
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

  async deleteStore(id: number): Promise<boolean> {
    const result = await db.delete(stores).where(eq(stores.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
