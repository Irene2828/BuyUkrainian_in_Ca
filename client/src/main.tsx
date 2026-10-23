
const STALE_CHUNK_ERRORS = [
  "is not a valid JavaScript MIME type",
  "Failed to fetch dynamically matched module",
  "Failed to fetch dynamically imported module",
  "ChunkLoadError",
];

function handleStaleChunkError(message?: string, isPreloadError?: boolean) {
  if (!isPreloadError) {
    if (!message || !STALE_CHUNK_ERRORS.some((err) => message.includes(err))) {
      return;
    }
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
  handleStaleChunkError(msg);
});

window.addEventListener("unhandledrejection", (event) => {
  const msg = (event.reason && (event.reason.message || String(event.reason))) || "";
  handleStaleChunkError(msg);
});

window.onerror = function(msg, url, lineNo, columnNo, error) {
  handleStaleChunkError(String(msg || ""));
  document.body.innerHTML = '<div style="color:red;padding:20px;z-index:9999;position:fixed;top:0;left:0;background:white;width:100%;height:100%;font-size:20px;">' + msg + '<br/>' + (error && error.stack ? error.stack : '') + '</div>';
  return false;
};
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initPremiumInteractions } from "./lib/premium-interactions";

// Initialize premium micro-interactions happens in App.tsx to ensure DOM is ready


createRoot(document.getElementById("root")!).render(<App />);
