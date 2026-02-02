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
  setupWebSocket(httpServer);

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

  httpServer.listen(config.port, "0.0.0.0", () => {
    log(`Server running on http://localhost:${config.port}`);
  });
})();
