import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Premium from "@/pages/Premium";
import Examples from "@/pages/Examples";
import Generator from "@/pages/Generator";
import News from "@/pages/News";
import Contacts from "@/pages/Contacts";
import Admin from "@/pages/Admin";
import Dashboard from "@/pages/Dashboard";
import Feedback from "@/pages/Feedback";
import Help from "@/pages/Help";
import Sitemap from "@/pages/Sitemap";
import PageGenerator from "@/pages/PageGenerator";
import Login from "@/pages/Login";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Important from "@/pages/Important";
import TestLogin from "@/pages/TestLogin";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Layout>
      <Switch>
        {/* Public routes */}
        <Route path="/" component={isAuthenticated ? Home : Landing} />
        <Route path="/auth" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/premium" component={Premium} />
        <Route path="/examples" component={Examples} />
        <Route path="/generator" component={Generator} />
        <Route path="/news" component={News} />
        <Route path="/news/:slug" component={News} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/feedback" component={Feedback} />
        <Route path="/help" component={Help} />
        <Route path="/sitemap" component={Sitemap} />
        <Route path="/page-generator" component={PageGenerator} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/important" component={Important} />
        <Route path="/test-login" component={TestLogin} />
        
        {/* Protected routes */}
        {isAuthenticated && (
          <>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/documents" component={Home} />
            <Route path="/notifications" component={Home} />
            <Route path="/admin" component={Admin} />
          </>
        )}
        
        {/* Admin routes fallback */}
        <Route path="/admin" component={Admin} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
