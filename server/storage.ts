import { type AdminUser, type InsertAdminUser, type Store, type InsertStore, stores, adminUsers } from "@shared/schema";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import fs from "fs";
import path from "path";
// Removed import.meta usage for CJS compatibility

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
  updateStoreImages(id: number, images: string[]): Promise<Store | undefined>;
  updateStore(id: number, updates: { name?: string; address?: string }): Promise<Store | undefined>;
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
    return await db.select().from(stores).where(eq(stores.status, "approved")).orderBy(desc(stores.approvedAt));
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
    const updateData: Partial<Store> = { status };
    if (status === "approved") {
      updateData.approvedAt = new Date();
    }
    const result = await db.update(stores)
      .set(updateData)
      .where(eq(stores.id, id))
      .returning();
    return result[0];
  }

  async updateStoreImages(id: number, images: string[]): Promise<Store | undefined> {
    const primaryImage = images.length > 0 ? images[0] : null;
    const result = await db.update(stores)
      .set({ images, image: primaryImage })
      .where(eq(stores.id, id))
      .returning();
    return result[0];
  }

  async updateStore(id: number, updates: { name?: string; address?: string }): Promise<Store | undefined> {
    const result = await db.update(stores)
      .set(updates)
      .where(eq(stores.id, id))
      .returning();
    return result[0];
  }

  async deleteStore(id: number): Promise<boolean> {
    const result = await db.delete(stores).where(eq(stores.id, id)).returning();
    return result.length > 0;
  }
}


export class MemStorage implements IStorage {
  private users: Map<number, AdminUser> = new Map();
  private stores: Map<number, Store> = new Map();
  private currentUserId = 1;
  private currentStoreId = 1;
  private dataDir = path.resolve(process.cwd(), "data");
  private adminsFile = path.join(this.dataDir, "admins.json");

  constructor() {
    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Try to load existing admins, otherwise seed default
    if (fs.existsSync(this.adminsFile)) {
      this.loadAdmins();
    } else {
      this.seedAdmin();
    }

    this.seed(); // Seed stores (volatile for now as per requirement focus on admin)
    this.importCsvData();
  }

  private loadAdmins() {
    try {
      const data = fs.readFileSync(this.adminsFile, "utf-8");
      const admins: AdminUser[] = JSON.parse(data);
      admins.forEach(admin => {
        // Ensure dates are parsed back to Date objects if needed, though JSON has them as strings.
        // In this app, we don't strictly use createdAt for logic, but let's be safe.
        this.users.set(admin.id, { ...admin, createdAt: new Date(admin.createdAt) });
        if (admin.id >= this.currentUserId) {
          this.currentUserId = admin.id + 1;
        }
      });
      console.log(`[MemStorage] Loaded ${this.users.size} admins from ${this.adminsFile}`);
    } catch (err) {
      console.error("[MemStorage] Failed to load admins:", err);
    }
  }

  private persistAdmins() {
    try {
      const data = JSON.stringify(Array.from(this.users.values()), null, 2);
      fs.writeFileSync(this.adminsFile, data);
    } catch (err) {
      console.error("[MemStorage] Failed to save admins:", err);
    }
  }

  private seedAdmin() {
    // Only seed if no admins exist
    if (this.users.size === 0) {
      this.createAdminUser({
        username: "admin",
        passwordHash: "$2b$10$oQh5MVXm5KgvMCdJXp2/b.5rbX0mAZq9885g4dIQqdnCdyfutv4B6" // admin
      });
    }
  }

  private async importCsvData() {
    try {
      const fs = await import("fs");
      const path = await import("path");

      const csvPath = path.resolve(process.cwd(), "attached_assets", "BlueYellow_CA_Stores_with_LatLng - stores.csv");

      if (!fs.existsSync(csvPath)) {
        console.log("CSV file not found at:", csvPath);
        return;
      }

      const content = fs.readFileSync(csvPath, "utf-8");
      // Split by newline and handle CR/LF
      const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

      // Skip header row
      const header = lines[0].split(",");
      const rows = lines.slice(1);

      console.log(`Found ${rows.length} stores in CSV`);

      for (const row of rows) {
        // Simple CSV parsing handling quotes
        const columns: string[] = [];
        let inQuotes = false;
        let currentValue = "";

        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            columns.push(currentValue.trim());
            currentValue = "";
          } else {
            currentValue += char;
          }
        }
        columns.push(currentValue.trim());

        // Map columns based on CSV structure:
        // store_id,store_name,type,address,city,province,postal_code,country,latitude,longitude,website,products_origin,notes,verified
        if (columns.length < 10) continue;

        const name = columns[1]?.replace(/^"|"$/g, "") || "";
        const type = columns[2]?.replace(/^"|"$/g, "") || "";
        const address = columns[3]?.replace(/^"|"$/g, "") || "";
        const city = columns[4]?.replace(/^"|"$/g, "") || "";
        const province = columns[5]?.replace(/^"|"$/g, "") || "";
        const postalCode = columns[6]?.replace(/^"|"$/g, "") || "";
        const lat = columns[8]?.replace(/^"|"$/g, "") || "";
        const lng = columns[9]?.replace(/^"|"$/g, "") || "";
        const website = columns[10]?.replace(/^"|"$/g, "") || "";
        const origin = columns[11]?.replace(/^"|"$/g, "") || "";
        const notes = columns[12]?.replace(/^"|"$/g, "") || "";

        // Determine category
        let category: "food" | "clothes" | "other" = "other";
        if (type.toLowerCase().includes("grocery") || type.toLowerCase().includes("deli") || type.toLowerCase().includes("bakery") || type.toLowerCase().includes("cafe") || type.toLowerCase().includes("restaurant")) {
          category = "food";
        } else if (type.toLowerCase().includes("clothing")) {
          category = "clothes";
        }

        // Create stored object
        const fullAddress = `${address}, ${city}, ${province} ${postalCode}`.trim();
        const description = `${origin}. ${notes}`.trim();

        // Check for duplicates
        const isDuplicate = Array.from(this.stores.values()).some(s =>
          s.name.toLowerCase() === name.toLowerCase() &&
          (Math.abs(parseFloat(s.latitude) - parseFloat(lat)) < 0.0001)
        );

        if (!isDuplicate) {
          await this.createStore({
            name,
            description: description || "Authentic Ukrainian products",
            products: ["Ukrainian Products"], // specific products not in CSV
            address: fullAddress,
            city,
            province,
            latitude: lat,
            longitude: lng,
            category,
            status: "approved",
            website: website || undefined,
            image: undefined,
            images: [],
            email: undefined
          });
        }
      }
      console.log(`Imported ${this.stores.size} stores total (including seeded)`);
    } catch (error) {
      console.error("Error importing CSV:", error);
    }
  }

  private seed() {
    this.createStore({
      name: "Kobzar Books",
      description: "Ukrainian bookstore in Toronto",
      products: ["Books", "Music", "Souvenirs"],
      address: "2205 Bloor St W, Toronto, ON M6S 1N5",
      city: "Toronto",
      province: "Ontario",
      latitude: "43.6503",
      longitude: "-79.4756",
      category: "other",
      status: "approved",
      website: "http://kobzar.com",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
      images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800"],
      email: "info@kobzar.com"
    });

    this.createStore({
      name: "Veselka Food Store",
      description: "Authentic Ukrainian grocery store",
      products: ["Varenyky", "Sausage", "Borscht", "Bread"],
      address: "123 Queen St W, Toronto, ON",
      city: "Toronto",
      province: "Ontario",
      latitude: "43.6487",
      longitude: "-79.3854",
      category: "food",
      status: "approved",
      website: "http://veselka.ca",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
      images: ["https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"],
      email: "service@veselka.ca"
    });
  }

  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    return this.users.get(id);
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getAllAdminUsers(): Promise<AdminUser[]> {
    return Array.from(this.users.values());
  }

  async createAdminUser(insertUser: InsertAdminUser): Promise<AdminUser> {
    const id = this.currentUserId++;
    const user: AdminUser = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    this.persistAdmins();
    return user;
  }

  async deleteAdminUser(id: number): Promise<boolean> {
    const deleted = this.users.delete(id);
    if (deleted) this.persistAdmins();
    return deleted;
  }

  async updateAdminPassword(id: number, passwordHash: string): Promise<AdminUser | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, passwordHash };
    this.users.set(id, updated);
    this.persistAdmins();
    return updated;
  }

  async getAllStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }

  async getApprovedStores(): Promise<Store[]> {
    const approved = Array.from(this.stores.values())
      .filter((store) => store.status === "approved")
      .sort((a, b) => {
        const timeA = a.approvedAt ? a.approvedAt.getTime() : (a.createdAt ? a.createdAt.getTime() : 0);
        const timeB = b.approvedAt ? b.approvedAt.getTime() : (b.createdAt ? b.createdAt.getTime() : 0);
        return timeB - timeA;
      });
    console.log(`[MemStorage] Found ${approved.length} approved stores`);
    return approved;
  }

  async getPendingStores(): Promise<Store[]> {
    return Array.from(this.stores.values()).filter(
      (store) => store.status === "pending",
    );
  }

  async getStore(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const id = this.currentStoreId++;
    const now = new Date();
    const store: Store = {
      ...insertStore,
      id,
      createdAt: now,
      status: insertStore.status || "pending",
      image: insertStore.image || (insertStore.images && insertStore.images.length > 0 ? insertStore.images[0] : null),
      images: insertStore.images || (insertStore.image ? [insertStore.image] : []),
      email: insertStore.email || null,
      website: insertStore.website || null, // Ensure website is handled
      approvedAt: insertStore.status === "approved" ? now : null
    };
    this.stores.set(id, store);
    return store;
  }

  async updateStoreStatus(
    id: number,
    status: "pending" | "approved" | "rejected",
  ): Promise<Store | undefined> {
    const store = this.stores.get(id);
    if (!store) return undefined;
    const updated = {
      ...store,
      status,
      approvedAt: status === "approved" ? new Date() : store.approvedAt
    };
    this.stores.set(id, updated);
    return updated;
  }

  async updateStoreImages(
    id: number,
    images: string[]
  ): Promise<Store | undefined> {
    const store = this.stores.get(id);
    if (!store) return undefined;
    const primaryImage = images.length > 0 ? images[0] : null;
    const updated = { ...store, images, image: primaryImage };
    this.stores.set(id, updated);
    return updated;
  }

  async updateStore(id: number, updates: { name?: string; address?: string }): Promise<Store | undefined> {
    const store = this.stores.get(id);
    if (!store) return undefined;
    const updated = { ...store, ...updates };
    this.stores.set(id, updated);
    return updated;
  }

  async deleteStore(id: number): Promise<boolean> {
    return this.stores.delete(id);
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
