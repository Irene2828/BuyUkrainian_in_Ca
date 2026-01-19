import { drizzle } from "drizzle-orm/neon-serverless";
// import ws from "ws"; // Removing ws import as it might trigger Vercel issues if not polyfilled
import * as schema from "@shared/schema";

// Safe initialization
let dbInstance: any = null;

if (process.env.DATABASE_URL) {
  try {
    dbInstance = drizzle({
      connection: process.env.DATABASE_URL,
      schema,
      // ws: ws, // Disabled for Vercel/Supabase HTTP config
    });
  } catch (e) {
    console.warn("Failed to init Drizzle DB (this is fine if using Supabase HTTP)", e);
  }
} else {
  // console.warn("DATABASE_URL is not set. The application will run with in-memory storage.");
}

export const db = dbInstance;
