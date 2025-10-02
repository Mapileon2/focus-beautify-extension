import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Dashboard } from './Dashboard';
import { LoginForm } from './LoginForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, User } from 'lucide-react';

export function AuthenticatedDashboard() {
  const { user, loading } = useAuth();

  console.log('AuthenticatedDashboard - User:', user, 'Loading:', loading);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Timer className="w-16 h-16 mb-4 text-primary animate-pulse" />
            <p className="text-muted-foreground">Loading Dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is authenticated - show full dashboard
  if (user) {
    console.log('AuthenticatedDashboard - Showing full dashboard for user:', user.email);
    return <Dashboard />;
  }

  // User is not authenticated - show simple login for extension context
  console.log('AuthenticatedDashboard - User not authenticated, showing login');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Timer className="w-12 h-12 text-blue-600" />
                <CardTitle>Focus Timer Dashboard</CardTitle>
              </div>
              <p className="text-gray-600">
                Sign in to access your productivity dashboard
              </p>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}