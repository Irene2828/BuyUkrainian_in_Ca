import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import rawViteConfig from "../../vite.config";
import fs from "fs";
import path from "path";

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  const viteConfig =
    typeof rawViteConfig === "function"
      ? await rawViteConfig({
          command: "serve",
          mode: "development",
          isPreview: false,
          isSsrBuild: false,
        })
      : rawViteConfig;

  const mergedServerConfig = {
    ...(viteConfig.server ?? {}),
    middlewareMode: true,
    // Enable HMR for local development so React updates properly.
    hmr: true,
    allowedHosts: true as const,
  };

  const serverOptions = {
    ...mergedServerConfig,
    // In embedded dev, API routes and app WebSockets already live on this same server.
    // Proxying back to localhost:3000 can create noisy self-referential reconnect loops.
    proxy: undefined,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      // Don't crash the whole server on Vite errors — just log them.
      error: (msg, options) => {
        viteLogger.error(msg, options);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Skip API routes - let them be handled by Express routes
    if (url.startsWith('/api')) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        process.cwd(),
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
