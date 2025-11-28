import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Stores table for Ukrainian product locations
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  products: text("products").array().notNull(),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  category: text("category").notNull(),
  image: text("image"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStoreSchema = createInsertSchema(stores, {
  name: z.string().min(2, "Store name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  products: z.array(z.string()).min(1, "At least one product is required"),
  address: z.string().min(5, "Address is required"),
  latitude: z.string().refine((val) => !isNaN(parseFloat(val)), "Invalid latitude"),
  longitude: z.string().refine((val) => !isNaN(parseFloat(val)), "Invalid longitude"),
  category: z.enum(["retail", "food", "services", "other"]),
  image: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
}).omit({ id: true, createdAt: true });

export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;
