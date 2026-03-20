import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
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
import MapPage from "@/pages/map";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AboutPage from "@/pages/about";
import NotFound from "@/pages/not-found";
import TestLab from "@/pages/test-lab";
import { initPremiumInteractions } from "./lib/premium-interactions";



function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/map" component={MapPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/test-lab" component={TestLab} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { getApprovedStores } from "./lib/api";

function App() {

  useEffect(() => {
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
              <APIProvider
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                authReferrerPolicy="origin"
              >
                <Toaster />
                <SonnerToaster />
                <Router />
              </APIProvider>
            </TooltipProvider>
          </QueryClientProvider>
        </I18nProvider>
      </ThemeProvider>
    </AccessibilityProvider>
  );
}

export default App;
