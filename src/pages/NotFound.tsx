import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, Home, ArrowLeft, Search, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleTryFreeTimer = () => {
    navigate('/?mode=guest');
  };

  const commonRoutes = [
    { path: '/', label: 'Home', description: 'Main landing page' },
    { path: '/app', label: 'Focus Timer', description: 'Start your productivity journey' },
    { path: '/dashboard', label: 'Dashboard', description: 'Analytics and insights' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Focus Timer</span>
          </div>
          <Button variant="ghost" onClick={handleGoHome}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </header>

      {/* 404 Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Error */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-blue-600 mb-4">404</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={handleGoHome}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Home
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleGoBack}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
            {!user && (
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleTryFreeTimer}
                className="border-blue-200 hover:bg-blue-50"
              >
                <Timer className="w-5 h-5 mr-2" />
                Try Free Timer
              </Button>
            )}
          </div>

          {/* Helpful Links */}
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Looking for something specific?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commonRoutes.map((route) => (
                  <button
                    key={route.path}
                    onClick={() => navigate(route.path)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{route.label}</div>
                    <div className="text-sm text-gray-600">{route.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Debug Info (Development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4" />
                <span className="font-medium text-sm">Debug Info</span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>Attempted URL:</strong> {location.pathname}</div>
                <div><strong>Search:</strong> {location.search}</div>
                <div><strong>Hash:</strong> {location.hash}</div>
                <div><strong>User:</strong> {user ? 'Authenticated' : 'Guest'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
