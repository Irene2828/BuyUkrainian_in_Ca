// MUST be first - loads environment variables and validates config
import { config } from "./config.js";

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

  // ERROR HANDLING is already in ./app.ts

  // Serve static files in production
  if (config.isProduction) {
    serveStatic(app);
  } else {
    // Dev mode: Vite hot reload
    const { setupVite } = await import("./vite.js");
    await setupVite(httpServer, app);
  }

  // =====================
  // START SERVER
  // =====================

  function startServer(port: number) {
    const server = httpServer.listen(port, "0.0.0.0")
      .on("listening", () => {
        const address = server.address();
        const actualPort = typeof address === 'string' ? address : address?.port;
        log(`Server running on http://localhost:${actualPort}`);

        // Only start WebSockets once the server is successfully listening
        setupWebSocket(httpServer);
      })
      .on("error", (err: any) => {
        if (err.code === "EADDRINUSE" && port !== 0) {
          log(`Port ${port} is already in use, trying an available port...`);
          startServer(0);
        } else {
          console.error("Server error:", err);
          process.exit(1);
        }
      });
  }

  startServer(config.port);
})();
