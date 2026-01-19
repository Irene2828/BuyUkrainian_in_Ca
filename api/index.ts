import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from './_lib/app';

export default function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Pass request to Express app
        return app(req, res);
    } catch (error: any) {
        console.error("❌ [Vercel] Runtime Crash:", error);

        res.status(500).json({
            error: "Server Runtime Failed",
            message: error.message || String(error),
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
            env_debug: {
                has_supabase_url: !!process.env.SUPABASE_URL,
                has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            }
        });
    }
}
