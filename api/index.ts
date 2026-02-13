import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from './_lib/app.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
    // Quick env health check before passing to Express
    const hasDb = !!process.env.DATABASE_URL;
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!hasDb || !hasSupabaseUrl || !hasSupabaseKey) {
        console.error("❌ [Vercel] Missing environment variables:", {
            DATABASE_URL: hasDb ? "SET" : "MISSING",
            NEXT_PUBLIC_SUPABASE_URL: hasSupabaseUrl ? "SET" : "MISSING",
            NEXT_PUBLIC_SUPABASE_ANON_KEY: hasSupabaseKey ? "SET" : "MISSING",
            NODE_ENV: process.env.NODE_ENV || "undefined",
            VERCEL_ENV: process.env.VERCEL_ENV || "undefined",
        });

        return res.status(503).json({
            error: "Service Unavailable",
            message: "Server environment is not configured. Please set DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Project Settings > Environment Variables.",
        });
    }

    try {
        return app(req, res);
    } catch (error: any) {
        console.error("❌ [Vercel] Runtime Crash:", error);
        res.status(500).json({
            error: "Server Runtime Failed",
            message: error.message || String(error),
        });
    }
}
