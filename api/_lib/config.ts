// Environment variables are injected by Vercel (production) or loaded by the dev server (local).

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
    // Log clearly but don't throw during module init — let the request handler report the error gracefully
    console.error(`⚠️  Configuration Error: Missing required environment variables: ${missingVars.join(", ")}`);
    console.error(`   Ensure these are set in Vercel Project Settings > Environment Variables`);
    console.error(`   Current NODE_ENV: ${process.env.NODE_ENV}`);
  }

  return {
    databaseUrl: process.env.DATABASE_URL || "",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    isProduction: process.env.NODE_ENV === "production",
    port: parseInt(process.env.PORT || "3000", 10),
  };
}

// Singleton config object
export const config = validateEnv();
