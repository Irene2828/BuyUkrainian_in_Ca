const STALE_CHUNK_ERRORS = [
  "is not a valid JavaScript MIME type",
  "Failed to fetch dynamically matched module",
  "Failed to fetch dynamically imported module",
  "ChunkLoadError",
];

function isScriptError(message?: string): boolean {
  return message === "Script error." || message === "Uncaught Script error.";
}

function handleFatalError(message?: string) {
  if (isScriptError(message)) {
    return;
  }

  const rootElement = document.getElementById("root");
  const isMounted = rootElement && rootElement.hasChildNodes();

  if (!isMounted) {
    handleStaleChunkError(message, true);
  }
}

function handleStaleChunkError(message?: string, forceReloadIfUnmounted?: boolean) {
  if (isScriptError(message)) {
    return;
  }

  if (!forceReloadIfUnmounted) {
    if (!message || !STALE_CHUNK_ERRORS.some((err) => message.includes(err))) {
      return;
    }
  }

  const rootElement = document.getElementById("root");
  const isMounted = rootElement && rootElement.hasChildNodes();

  // If already mounted and not a specific chunk error, don't reload
  if (isMounted && !STALE_CHUNK_ERRORS.some((err) => message && message.includes(err))) {
    return;
  }

  const key = "bu.chunkReloadAt";
  const lastReload = sessionStorage.getItem(key);
  const now = Date.now();
  if (!lastReload || now - Number(lastReload) > 30000) {
    sessionStorage.setItem(key, String(now));
    window.location.reload();
  }
}

window.addEventListener("vite:preloadError", () => {
  handleStaleChunkError(undefined, true);
});

window.addEventListener("error", (event) => {
  const msg = event.message || (event.error && event.error.message) || "";
  if (isScriptError(msg)) {
    console.error("Ignored script error:", event);
    return;
  }
  handleStaleChunkError(msg);
  handleFatalError(msg);
});

window.addEventListener("unhandledrejection", (event) => {
  const msg = (event.reason && (event.reason.message || String(event.reason))) || "";
  if (isScriptError(msg)) {
    console.error("Ignored unhandled rejection script error:", event);
    return;
  }
  handleStaleChunkError(msg);
  handleFatalError(msg);
});

window.onerror = function(msg, url, lineNo, columnNo, error) {
  const messageStr = String(msg || "");
  console.error("Global error caught:", messageStr, url, lineNo, columnNo, error);
  if (isScriptError(messageStr)) {
    return false;
  }
  handleStaleChunkError(messageStr);
  handleFatalError(messageStr);
  return false;
};

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initPremiumInteractions } from "./lib/premium-interactions";

// Initialize premium micro-interactions happens in App.tsx to ensure DOM is ready


createRoot(document.getElementById("root")!).render(<App />);
