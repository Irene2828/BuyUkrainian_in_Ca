// This file MUST be imported first to ensure environment variables are loaded
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env.local for local development
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Also try .env as fallback
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
