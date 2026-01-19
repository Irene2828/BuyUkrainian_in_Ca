import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Dynamic import to catch initialization errors (like missing env vars or bad imports)
        const appModule = await import('../server/app');
        const app = appModule.default;

        return app(req, res);
    } catch (error: any) {
        console.error("❌ [Vercel] Startup Crash:", error);

        res.status(500).json({
            error: "Server Startup Failed",
            message: error.message || String(error),
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
            env_debug: {
                has_supabase_url: !!process.env.SUPABASE_URL,
                has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
                node_env: process.env.NODE_ENV
            }
        });
    }
}
