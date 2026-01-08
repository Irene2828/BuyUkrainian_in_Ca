import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupWebSocket } from "./websocket";
import { serveStatic } from "./static";
import { createServer } from "http";
import { securityMiddleware } from "./security";
import cors from "cors";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// =====================
// DEVELOPMENT / PRODUCTION MODE
// =====================
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  // Production security
  app.use(securityMiddleware.helmet);
  app.use(securityMiddleware.generalRateLimit);
  console.log("Production mode: security middleware active");
} else {
  // Dev mode: allow all origins, disable security
  console.log("Development mode: security middleware disabled");
  app.use(cors());
}

// =====================
// BODY PARSING
// =====================
app.use(
  express.json({
    limit: "100kb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

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
// ASYNC SERVER INIT
// =====================
(async () => {
  await registerRoutes(httpServer, app);
  setupWebSocket(httpServer);

  // ERROR HANDLING
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;

    if (isProduction) {
      log(`Error: ${err.message}`, "error");
      res.status(status).json({
        error:
          status >= 500
            ? "An unexpected error occurred. Please try again later."
            : err.message,
      });
    } else {
      console.error("Error:", err);
      res.status(status).json({ error: err.message || "Internal Server Error" });
    }
  });

  // Serve static files in production
  if (isProduction) {
    serveStatic(app);
  } else {
    // Dev mode: Vite hot reload
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // =====================
  // START SERVER
  // =====================
  const DEFAULT_PORT = 3000; // default dev port
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT;

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();
