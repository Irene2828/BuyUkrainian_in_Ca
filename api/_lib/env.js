// This file MUST be imported first to ensure environment variables are loaded
import dotenv from "dotenv";
// Load .env.local for local development
dotenv.config({ path: ".env.local" });
// Also try .env as fallback
dotenv.config();
