// MUST be first - loads environment variables
import "./env.js";
import app from "./app.js";
import { setupWebSocket } from "./websocket.js";
import { serveStatic } from "./static.js";
import { createServer } from "http";
import { log } from "./app.js";
const httpServer = createServer(app);
// =====================
// ASYNC SERVER INIT (Local Dev)
// =====================
(async () => {
    // Routes are already registered in ./app.ts
    setupWebSocket(httpServer);
    const isProduction = process.env.NODE_ENV === "production";
    // ERROR HANDLING is already in ./app.ts
    // Serve static files in production
    if (isProduction) {
        serveStatic(app);
    }
    else {
        // Dev mode: Vite hot reload
        const { setupVite } = await import("./vite.js");
        await setupVite(httpServer, app);
    }
    // =====================
    // START SERVER
    // =====================
    const DEFAULT_PORT = 3000; // default dev port
    const PORT = process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT;
    httpServer.listen(PORT, "0.0.0.0", () => {
        log(`Server running on http://localhost:${PORT}`);
    });
})();
