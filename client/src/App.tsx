import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient, setupWebSocketListener } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import "./App.css"; // Reinforced design styles
// Confirming Pre-Footer Design Re-render
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n";
import Home from "@/pages/home";
import MapPage from "@/pages/map";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AboutPage from "@/pages/about";
import NotFound from "@/pages/not-found";
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();

  useEffect(() => {
    setupWebSocketListener();
    initPremiumInteractions();
  }, [location]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>

      <I18nProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <SonnerToaster />
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
