import "./env.js";

// Define the required environment variables
const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

interface Config {
  databaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  isProduction: boolean;
  port: number;
}

function validateEnv(): Config {
  const missingVars: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missingVars.push(key);
    }
  }

  if (missingVars.length > 0) {
    const errorMsg = `Configuration Error: Missing required environment variables: ${missingVars.join(", ")}`;
    // We throw a standard error here, but the consumer can catch it and exit gracefully if needed.
    // However, for startup, crashing with a clear message is often desired on the server.
    throw new Error(errorMsg);
  }

  return {
    databaseUrl: process.env.DATABASE_URL!,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    isProduction: process.env.NODE_ENV === "production",
    port: parseInt(process.env.PORT || "3000", 10),
  };
}

// Singleton config object
export const config = validateEnv();
