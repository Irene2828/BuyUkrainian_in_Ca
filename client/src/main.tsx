import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initPremiumInteractions } from "./lib/premium-interactions";

// Initialize premium micro-interactions happens in App.tsx to ensure DOM is ready


createRoot(document.getElementById("root")!).render(<App />);
