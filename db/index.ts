import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not set. The application will run with in-memory storage.",
  );
}

export const db = process.env.DATABASE_URL
  ? drizzle({
    connection: process.env.DATABASE_URL,
    schema,
    ws: ws,
  })
  : (null as any);
