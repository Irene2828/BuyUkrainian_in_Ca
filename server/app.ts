import express from "express";
import { registerRoutes } from "./routes";
import { securityMiddleware } from "./security";
import cors from "cors";
const app = express();
// Log critical environment variables for debugging (production only)
if (process.env.NODE_ENV === "production") {
    console.log("[Env] DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "MISSING");
    console.log("[Env] SUPABASE_URL:", process.env.SUPABASE_URL ? "SET" : "MISSING");
    console.log("[Env] SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING");
}


const isProduction = process.env.NODE_ENV === "production";

// =====================
// SECURITY & CONFIG
// =====================
if (isProduction) {
    app.use(securityMiddleware.helmet);
    app.use(securityMiddleware.generalRateLimit);
}

// CORS: Permissive for now to ensure connectivity
app.use(cors());

// =====================
// LOGGING
// =====================
export function log(message: string, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }
            log(logLine);
        }
    });

    next();
});

// =====================
// BODY PARSING
// =====================
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

// =====================
// ROUTE REGISTRATION
// =====================
// Pass a dummy server object because we aren't listening here
import { createServer } from "http";
const dummyServer = createServer(app);
registerRoutes(dummyServer, app);

// =====================
// ERROR HANDLING
// =====================
app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    console.error("Global Error Handler:", err);

    const errorResponse = {
        error: err.message || "An unexpected error occurred.",
        details: isProduction ? err.toString() : undefined
    };

    res.status(status).json(errorResponse);
});

export default app;
