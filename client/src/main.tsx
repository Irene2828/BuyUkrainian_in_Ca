
window.onerror = function(msg, url, lineNo, columnNo, error) {
  document.body.innerHTML = '<div style="color:red;padding:20px;z-index:9999;position:fixed;top:0;left:0;background:white;width:100%;height:100%;font-size:20px;">' + msg + '<br/>' + (error && error.stack ? error.stack : '') + '</div>';
  return false;
};
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initPremiumInteractions } from "./lib/premium-interactions";

// Initialize premium micro-interactions happens in App.tsx to ensure DOM is ready


createRoot(document.getElementById("root")!).render(<App />);
