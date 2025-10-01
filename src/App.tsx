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
import { ExternalSmilePopupPage } from "./pages/ExternalSmilePopupPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
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
  const isExtension = typeof window !== 'undefined' && 
    (window.location.protocol === 'chrome-extension:' || 
     window.location.pathname.includes('.html'));
  
  // Use HashRouter for extension, BrowserRouter for web development
  const Router = isExtension ? HashRouter : BrowserRouter;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Router>
              <Routes>
                <Route path="/" element={<ChromeExtensionMain />} />
                <Route path="/index.html" element={<ChromeExtensionMain />} />
                <Route path="/fullapp" element={<Index />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/smile-popup" element={<ExternalSmilePopupPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
