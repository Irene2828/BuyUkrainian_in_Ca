import { defineConfig } from "vite";
// Force rebuild timestamp: 2026-01-31T21:45:00
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    metaImagesPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'https://buy-ukrainian-in-cajan23.vercel.app',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'https://buy-ukrainian-in-cajan23.vercel.app',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
