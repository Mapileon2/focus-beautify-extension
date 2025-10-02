import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/components/AuthProvider";
import Index from "./pages/Index";
import { ChromeExtensionMain } from "./pages/ChromeExtensionMain";
import { DashboardPage } from "./pages/DashboardPage";
import { Dashboard } from "./components/Dashboard";
import { AuthenticatedDashboard } from "./components/AuthenticatedDashboard";
import { ExternalSmilePopupPage } from "./pages/ExternalSmilePopupPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { EmailConfirmationPage } from "./pages/EmailConfirmationPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  // Determine if we're in extension context or web development
  const isExtension = typeof window !== 'undefined' && (
    window.location.protocol === 'chrome-extension:' ||
    window.location.pathname.includes('.html') ||
    window.location.href.includes('chrome-extension://') ||
    (window as any).chrome?.runtime?.id
  );
  
  // Use HashRouter for extension, BrowserRouter for web development
  const Router = isExtension ? HashRouter : BrowserRouter;

  // Handle email confirmation from URL hash
  React.useEffect(() => {
    const handleEmailConfirmation = () => {
      const hash = window.location.hash;
      if (hash.includes('access_token') || hash.includes('error=')) {
        // Redirect to email confirmation page with the hash parameters
        const params = new URLSearchParams(hash.substring(1));
        const searchParams = new URLSearchParams();
        
        // Convert hash parameters to search parameters
        for (const [key, value] of params) {
          searchParams.set(key, value);
        }
        
        // Redirect to confirmation page
        window.location.href = `/confirm-email?${searchParams.toString()}`;
      }
    };

    handleEmailConfirmation();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Router>
              <Routes>
                {/* Chrome Extension Routes - Extension gets priority */}
                {isExtension ? (
                  <>
                    {/* Main extension popup routes */}
                    <Route path="/" element={<ChromeExtensionMain />} />
                    <Route path="/index" element={<ChromeExtensionMain />} />
                    
                    {/* Dashboard extension routes - Direct to authenticated dashboard, no freemium */}
                    <Route path="/dashboard" element={<AuthenticatedDashboard />} />
                    <Route path="/dashboard/*" element={<AuthenticatedDashboard />} />
                    
                    {/* Full app extension routes */}
                    <Route path="/fullapp" element={<Index />} />
                    <Route path="/app" element={<Index />} />
                    
                    {/* Utility extension routes */}
                    <Route path="/smile-popup" element={<ExternalSmilePopupPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/confirm-email" element={<EmailConfirmationPage />} />
                    
                    {/* Fallback for extension */}
                    <Route path="*" element={<ChromeExtensionMain />} />
                  </>
                ) : (
                  <>
                    {/* Web App Routes - Freemium Flow */}
                    <Route path="/" element={<Index />} />
                    <Route path="/app" element={<Index />} />
                    <Route path="/fullapp" element={<Index />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    
                    {/* Auth & Utility Routes */}
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/smile-popup" element={<ExternalSmilePopupPage />} />
                    <Route path="/confirm-email" element={<EmailConfirmationPage />} />
                    
                    {/* 404 Catch-all - Must be last */}
                    <Route path="*" element={<NotFound />} />
                  </>
                )}
              </Routes>
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
