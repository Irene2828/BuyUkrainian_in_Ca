import express from "express";
import { registerRoutes } from "./server_routes.js";
import { securityMiddleware, isProductionEnv } from "./security.js";
import cors from "cors";
const app = express();
// Log critical environment variables for debugging (production only)
if (process.env.NODE_ENV === "production") {
    console.log("[Env] DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "MISSING");
    console.log("[Env] NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING");
    console.log("[Env] SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING");
}


const isProduction = isProductionEnv();

// =====================
// SECURITY & CONFIG
// =====================
// Trust the Vercel edge proxy so req.ip correctly reflects the client IP instead of the proxy IP
app.set("trust proxy", 1);

if (isProduction) {
    app.use(securityMiddleware.helmet);
    app.use(securityMiddleware.generalRateLimit);
}

// CORS: Restrict to allowed origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://buyukrainian.ca,https://www.buyukrainian.ca').split(',');

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (!isProduction && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

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
            // EGRESS OPTIMIZATION: Truncate logged response to 200 chars
            // Prevents logging entire store arrays which wastes memory and log egress
            if (capturedJsonResponse) {
                const jsonStr = JSON.stringify(capturedJsonResponse);
                logLine += ` :: ${jsonStr.length > 200 ? jsonStr.slice(0, 200) + '…' : jsonStr}`;
            }
            log(logLine);
        }
    });

    next();
});

import { requireAdmin } from "./security.js";

// =====================
// BODY PARSERS
// =====================
// Vercel serverless limit is 4.5MB, so we cap at 4mb to be safe.
const smallJsonParser = express.json({ limit: "100kb" });
const adminJsonParser = express.json({ limit: "4mb" });

app.use((req, res, next) => {
    // For protected admin routes (everything under /api/admin except login),
    // require authentication BEFORE parsing any large JSON payload.
    if (req.path.startsWith("/api/admin") && req.path !== "/api/admin/login") {
        requireAdmin(req, res, (err) => {
            if (err) return next(err);
            adminJsonParser(req, res, (err2) => {
                if (err2) return next(err2);
                express.urlencoded({ extended: false, limit: "4mb" })(req, res, next);
            });
        });
        return;
    }
    
    // For public routes and admin login, parse immediately with a strict 100kb limit.
    smallJsonParser(req, res, (err) => {
        if (err) return next(err);
        express.urlencoded({ extended: false, limit: "100kb" })(req, res, next);
    });
});

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
        error: isProduction ? "Internal Server Error" : (err.message || "An unexpected error occurred."),
        details: isProduction ? undefined : err.toString()
    };

    res.status(status).json(errorResponse);
});

export default app;
