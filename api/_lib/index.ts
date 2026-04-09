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
    const onListening = () => {
      httpServer.off("error", onError);

      const address = httpServer.address();
      const actualPort = typeof address === "string" ? address : address?.port;
      log(`Server running on http://localhost:${actualPort}`);

      // Only start WebSockets once the server is successfully listening.
      // This retry path must stay idempotent when port 3000 is occupied.
      setupWebSocket(httpServer);
    };

    const onError = (err: any) => {
      httpServer.off("listening", onListening);

      if (err.code === "EADDRINUSE" && port !== 0) {
        if (port === config.port && port === 3000) {
          log(`Port ${port} is already in use, trying localhost:${3001}...`);
          startServer(3001);
          return;
        }

        log(`Port ${port} is already in use, trying an available port...`);
        startServer(0);
      } else {
        console.error("Server error:", err);
        process.exit(1);
      }
    };

    httpServer.once("listening", onListening);
    httpServer.once("error", onError);
    httpServer.listen(port, "0.0.0.0");
  }

  startServer(config.port);
})();
