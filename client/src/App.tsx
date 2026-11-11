import { Switch, Route } from "wouter";
import { Suspense, lazy, useEffect } from "react";
import { queryClient, setupWebSocketListener } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import "./App.css"; // Reinforced design styles
// Confirming Pre-Footer Design Re-render: 2026-01-31T21:55:00
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n";
import { AccessibilityProvider } from "@/contexts/accessibility-context";
import Home from "@/pages/home";
import { initPremiumInteractions } from "./lib/premium-interactions";
import { GlobalAddStoreModal } from "@/components/global-add-store-modal";
import currentLogo from "@/assets/logoo.png";

const MapPage = lazy(() => import("@/pages/map"));
const AdminLogin = lazy(() => import("@/pages/admin/login"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const PrivacyPage = lazy(() => import("@/pages/privacy"));
const NotFound = lazy(() => import("@/pages/not-found"));
const TestLab = lazy(() => import("@/pages/test-lab"));

function RouteFallback() {
  return <div className="min-h-screen bg-white" />;
}

function Router() {
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  return (
    <Suspense fallback={<RouteFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/map" component={MapPage} />
        <Route path="/privacy" component={PrivacyPage} />
        
        {isLocalhost && (
          <>
            <Route path="/admin" component={AdminLogin} />
            <Route path="/admin/login" component={AdminLogin} />
            <Route path="/admin/dashboard" component={AdminDashboard} />
          </>
        )}
        
        <Route path="/test-lab" component={TestLab} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

import { getApprovedStores } from "./lib/api";

function App() {
  useEffect(() => {
    const favicon = document.createElement("link");
    favicon.id = "site-favicon";
    favicon.rel = "icon";
    favicon.type = "image/png";
    favicon.href = currentLogo;
    document.head.querySelector("#site-favicon")?.remove();
    document.head.appendChild(favicon);

    const cleanupWebSocket = setupWebSocketListener();
    initPremiumInteractions();

    // EGRESS OPTIMIZATION: Prefetch store data once on initial load only
    // Previously re-prefetched on every route change via [location] dependency
    queryClient.prefetchQuery({
      queryKey: ["stores"],
      queryFn: getApprovedStores,
    }).catch(console.error);

    return cleanupWebSocket;
  }, []); // Empty deps = runs once on mount, not on every navigation

  return (
    <AccessibilityProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <I18nProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <SonnerToaster />
              <GlobalAddStoreModal />
              <Router />
            </TooltipProvider>
          </QueryClientProvider>
        </I18nProvider>
      </ThemeProvider>
    </AccessibilityProvider>
  );
}

export default App;
