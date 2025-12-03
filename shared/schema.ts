import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers, {
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username too long"),
  passwordHash: z.string(),
}).omit({ id: true, createdAt: true });

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

// Stores table for Ukrainian product locations (products only, no services)
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
  email: text("email"), // Optional email for notifications
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_ADDRESS_LENGTH = 200;
const MAX_PRODUCT_LENGTH = 50;
const MAX_PRODUCTS_COUNT = 20;
const MAX_EMAIL_LENGTH = 100;
const MAX_IMAGE_URL_LENGTH = 500;

const sanitizedString = z.string().transform((val) => {
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
});

export const insertStoreSchema = createInsertSchema(stores, {
  name: sanitizedString
    .pipe(z.string().min(2, "Store name must be at least 2 characters").max(MAX_NAME_LENGTH, `Store name must be at most ${MAX_NAME_LENGTH} characters`)),
  description: sanitizedString
    .pipe(z.string().min(10, "Description must be at least 10 characters").max(MAX_DESCRIPTION_LENGTH, `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters`)),
  products: z.array(
    sanitizedString.pipe(z.string().min(1).max(MAX_PRODUCT_LENGTH, `Product name must be at most ${MAX_PRODUCT_LENGTH} characters`))
  ).min(1, "At least one product is required").max(MAX_PRODUCTS_COUNT, `Maximum ${MAX_PRODUCTS_COUNT} products allowed`),
  address: sanitizedString
    .pipe(z.string().min(5, "Address is required").max(MAX_ADDRESS_LENGTH, `Address must be at most ${MAX_ADDRESS_LENGTH} characters`)),
  latitude: z.string()
    .refine((val) => !isNaN(parseFloat(val)), "Invalid latitude")
    .refine((val) => {
      const lat = parseFloat(val);
      return lat >= 40 && lat <= 85;
    }, "Location must be within Canada (latitude 40-85)"),
  longitude: z.string()
    .refine((val) => !isNaN(parseFloat(val)), "Invalid longitude")
    .refine((val) => {
      const lng = parseFloat(val);
      return lng >= -140 && lng <= -50;
    }, "Location must be within Canada (longitude -140 to -50)"),
  category: z.enum(["food", "clothes", "other"]),
  image: z.string().max(MAX_IMAGE_URL_LENGTH, "Image URL too long").url("Invalid image URL").optional().or(z.literal("")),
  email: z.string().max(MAX_EMAIL_LENGTH, "Email too long").email("Invalid email").optional().or(z.literal("")),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
}).omit({ id: true, createdAt: true });

export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;
