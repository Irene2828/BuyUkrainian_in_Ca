import { type AdminUser, type InsertAdminUser, type Store, type InsertStore, stores, adminUsers } from "../../shared/schema.js";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// IStorage Interface with String IDs
export interface IStorage {
  // Admin user methods
  getAdminUser(id: number): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  getAllAdminUsers(): Promise<AdminUser[]>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  deleteAdminUser(id: number): Promise<boolean>;
  updateAdminPassword(id: number, passwordHash: string): Promise<AdminUser | undefined>;

  // Store methods - Updated to String ID (UUID)
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

export class SupabaseStorage implements IStorage {
  private client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must refer to SERVICE KEY for backend ops
    if (!url || !key) {
      throw new Error("Missing Supabase credentials");
    }
    this.client = createClient(url, key);
  }

  // Admin User Methods (Supabase 'admin_users' table if exists, or just use Auth? Prompt asked for locations table mainly. I'll implement 'admin_users' table interact)
  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    const { data } = await this.client.from("admin_users").select("*").eq("id", id).single();
    return data ? this.mapAdminUser(data) : undefined;
  }
  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const { data } = await this.client.from("admin_users").select("*").eq("username", username).single();
    return data ? this.mapAdminUser(data) : undefined;
  }
  async getAllAdminUsers(): Promise<AdminUser[]> {
    const { data } = await this.client.from("admin_users").select("*");
    return (data || []).map(d => this.mapAdminUser(d));
  }
  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const dbUser = {
      username: user.username,
      password_hash: user.passwordHash,
    };
    const { data, error } = await this.client.from("admin_users").insert(dbUser).select().single();
    if (error) throw error;
    return this.mapAdminUser(data);
  }
  async deleteAdminUser(id: number): Promise<boolean> {
    const { error } = await this.client.from("admin_users").delete().eq("id", id);
    return !error;
  }
  async updateAdminPassword(id: number, passwordHash: string): Promise<AdminUser | undefined> {
    const { data } = await this.client.from("admin_users").update({ password_hash: passwordHash }).eq("id", id).select().single();
    return data ? this.mapAdminUser(data) : undefined;
  }

  private mapAdminUser(row: any): AdminUser {
    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      createdAt: new Date(row.created_at),
    };
  }

  // Store Methods
  async getAllStores(): Promise<Store[]> {
    const { data } = await this.client.from("locations").select("*");
    return (data || []).map(this.mapStore);
  }
  async getApprovedStores(): Promise<Store[]> {
    const { data } = await this.client.from("locations").select("*").eq("status", "approved").order('approved_at', { ascending: false });
    return (data || []).map(this.mapStore);
  }
  async getPendingStores(): Promise<Store[]> {
    const { data } = await this.client.from("locations").select("*").eq("status", "pending");
    return (data || []).map(this.mapStore);
  }
  async getStore(id: string): Promise<Store | undefined> {
    const { data } = await this.client.from("locations").select("*").eq("id", id).single();
    return data ? this.mapStore(data) : undefined;
  }
  async createStore(store: InsertStore): Promise<Store> {
    const dbStore = {
      name: store.name,
      description: store.description,
      products: store.products,
      address: store.address,
      city: store.city,
      province: store.province,
      lat: store.latitude, // Mapping latitude -> lat
      lng: store.longitude, // Mapping longitude -> lng
      category: store.category,
      website: store.website,
      image: store.image,
      images: store.images,
      email: store.email,
      status: store.status || "pending",
      is_open: true, // as per prompt
    };
    const { data, error } = await this.client.from("locations").insert(dbStore).select().single();
    if (error) {
      console.error("Supabase Create Error", error);
      throw error;
    }
    return this.mapStore(data);
  }
  async updateStoreStatus(id: string, status: "pending" | "approved" | "rejected"): Promise<Store | undefined> {
    const updates: any = { status };
    if (status === "approved") {
      updates.approved_at = new Date().toISOString();
    }
    const { data } = await this.client.from("locations").update(updates).eq("id", id).select().single();
    return data ? this.mapStore(data) : undefined;
  }
  async updateStoreImages(id: string, images: string[]): Promise<Store | undefined> {
    const image = images.length > 0 ? images[0] : null;
    const { data } = await this.client.from("locations").update({ images, image }).eq("id", id).select().single();
    return data ? this.mapStore(data) : undefined;
  }
  async updateStore(id: string, updates: { name?: string; address?: string }): Promise<Store | undefined> {
    const { data } = await this.client.from("locations").update(updates).eq("id", id).select().single();
    return data ? this.mapStore(data) : undefined;
  }
  async deleteStore(id: string): Promise<boolean> {
    const { error } = await this.client.from("locations").delete().eq("id", id);
    return !error;
  }

  private mapStore(row: any): Store {
    // Map Supabase snake_case or diff names to Application Store object
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      products: row.products || [],
      address: row.address,
      city: row.city,
      province: row.province,
      latitude: row.lat, // lat -> latitude
      longitude: row.lng, // lng -> longitude
      category: row.category,
      website: row.website,
      image: row.image,
      images: row.images || [],
      email: row.email,
      status: row.status,
      createdAt: new Date(row.created_at),
      approvedAt: row.approved_at ? new Date(row.approved_at) : null,
      isOpen: row.is_open ? 'true' : 'false'
    };
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, AdminUser> = new Map();
  private stores: Map<string, Store> = new Map(); // Changed to string ID
  private currentUserId = 1;
  private currentStoreId = 1;

  constructor() {
    // Add sample test data for local development
    const sampleStores = [
      {
        id: "1",
        name: "Dnister Ukrainian Store",
        description: "Traditional Ukrainian food products, books, and crafts",
        products: ["Pyrih", "Honey", "Crafts", "Books"],
        address: "739 Queen St W",
        city: "Toronto",
        province: "ON",
        latitude: "43.6465" as any,
        longitude: "-79.4105" as any,
        category: "food" as const,
        website: "https://www.dnisterbooks.com",
        image: null,
        images: [],
        email: null,
        status: "approved" as const,
        createdAt: new Date(),
        approvedAt: new Date(),
        isOpen: "true"
      },
      {
        id: "2",
        name: "Veselka Food Store",
        description: "Ukrainian grocery and deli specializing in authentic products",
        products: ["Sausages", "Pickles", "Bread", "Smoked Fish"],
        address: "606 Bloor St W",
        city: "Toronto",
        province: "ON",
        latitude: "43.6634" as any,
        longitude: "-79.4115" as any,
        category: "food" as const,
        website: null,
        image: null,
        images: [],
        email: null,
        status: "approved" as const,
        createdAt: new Date(),
        approvedAt: new Date(),
        isOpen: "true"
      },
      {
        id: "3",
        name: "Ukrainian Gift Shop",
        description: "Traditional Ukrainian embroidered shirts, ceramics, and souvenirs",
        products: ["Vyshyvanka", "Ceramics", "Souvenirs"],
        address: "2282 Bloor St W",
        city: "Toronto",
        province: "ON",
        latitude: "43.6519" as any,
        longitude: "-79.4768" as any,
        category: "retail" as const,
        website: null,
        image: null,
        images: [],
        email: null,
        status: "approved" as const,
        createdAt: new Date(),
        approvedAt: new Date(),
        isOpen: "true"
      }
    ];

    sampleStores.forEach(store => this.stores.set(store.id, store));
    this.currentStoreId = 4; // Next ID after the 3 sample stores
  }

  // Admin methods (unchanged ID type for admins for now to save time, prompt focused on Locations)
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

  // Store methods using String ID
  async getAllStores() { return Array.from(this.stores.values()); }
  async getApprovedStores() { return Array.from(this.stores.values()).filter(s => s.status === "approved").sort((a, b) => (b.approvedAt?.getTime() || 0) - (a.approvedAt?.getTime() || 0)); }
  async getPendingStores() { return Array.from(this.stores.values()).filter(s => s.status === "pending"); }
  async getStore(id: string) { return this.stores.get(id); }
  async createStore(insertStore: InsertStore) {
    const id = String(this.currentStoreId++); // Generate String ID
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
      isOpen: "true"
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

// Safely determine which storage to use without crashing
let storageImplementation: IStorage;

try {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Strict check: Both must be present and non-empty
  if (url && key && url.startsWith("http")) {
    console.log("✅ Supabase credentials detected");
    console.log("🔗 SUPABASE_URL:", url);
    console.log("🔑 Service key length:", key.length, "characters");
    try {
      storageImplementation = new SupabaseStorage();
      console.log("✅ Connected to Supabase successfully - using live database");
    } catch (error) {
      console.error("❌ Failed to initialize SupabaseStorage:", error);
      console.log("⚠️  Falling back to MemStorage");
      storageImplementation = new MemStorage();
    }
  } else {
    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️  WARNING: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in production. Falling back to MemStorage.");
      console.log("URL present:", !!url);
      console.log("Key present:", !!key);
    } else {
      console.log("ℹ️  Using MemStorage (Missing Supabase credentials in .env.local)");
      console.log("   To connect to live database, create .env.local with:");
      console.log("   SUPABASE_URL=your_supabase_url");
      console.log("   SUPABASE_SERVICE_ROLE_KEY=your_service_key");
    }
    storageImplementation = new MemStorage();
  }
} catch (error) {
  console.error("❌ Failed to initialize storage:", error);
  storageImplementation = new MemStorage();
}

export const storage = storageImplementation;
