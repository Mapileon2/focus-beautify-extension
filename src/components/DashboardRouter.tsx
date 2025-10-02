import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/userService';
import { Dashboard } from './Dashboard';
import { AuthFlow } from './AuthFlow';
import { OnboardingWizard } from './OnboardingWizard';
import { WelcomeScreen } from './WelcomeScreen';
import { FocusTimer } from './FocusTimer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Timer, 
  Play, 
  ArrowRight, 
  Loader2, 
  User, 
  Lock,
  BarChart3,
  Target,
  Brain,
  RefreshCw,
  Zap
} from 'lucide-react';

type DashboardState = 
  | 'landing'           // Show dashboard landing for visitors
  | 'guest-timer'       // Basic timer within dashboard
  | 'auth-required'     // Show auth flow in dashboard
  | 'onboarding'        // New user onboarding
  | 'welcome'           // Post-onboarding welcome
  | 'app'               // Full dashboard
  | 'loading';          // Loading state

export function DashboardRouter() {
  const { user, loading: authLoading } = useAuth();
  const [dashboardState, setDashboardState] = useState<DashboardState>('loading');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [manualStateChange, setManualStateChange] = useState(false);

  console.log('DashboardRouter - Current state:', dashboardState, 'User:', user, 'AuthLoading:', authLoading);

  // Expose global function for feature gates
  useEffect(() => {
    (window as any).triggerDashboardAuth = () => {
      console.log('DashboardRouter: Global triggerDashboardAuth called');
      setManualStateChange(true);
      setDashboardState('auth-required');
    };
    
    return () => {
      delete (window as any).triggerDashboardAuth;
    };
  }, []);

  useEffect(() => {
    const checkDashboardState = async () => {
      if (manualStateChange) {
        console.log('DashboardRouter: Skipping auto state check due to manual change');
        return;
      }
      
      if (authLoading) return;

      // Check URL parameters for direct routing
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      
      if (mode === 'guest' && !user) {
        setDashboardState('guest-timer');
        return;
      }
      
      if (mode === 'auth') {
        setDashboardState('auth-required');
        return;
      }

      if (!user) {
        // No user - show dashboard landing
        setDashboardState('landing');
        return;
      }

      try {
        // User is authenticated - check profile status
        const profile = await UserService.getUserProfile(user.id);
        setUserProfile(profile);

        if (!profile) {
          setDashboardState('onboarding');
        } else if (!profile.onboarding_completed) {
          setDashboardState('onboarding');
        } else {
          const hasSeenWelcome = localStorage.getItem(`dashboard-welcome-seen-${user.id}`);
          if (!hasSeenWelcome) {
            setDashboardState('welcome');
          } else {
            setDashboardState('app');
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        setDashboardState('onboarding');
      }
    };

    checkDashboardState();
  }, [user, authLoading, manualStateChange]);

  // Event listeners for feature gates
  useEffect(() => {
    const handleAuthRequest = (event: CustomEvent) => {
      console.log('DashboardRouter: Received auth request:', event.detail);
      setManualStateChange(true);
      setDashboardState('auth-required');
    };

    window.addEventListener('request-dashboard-auth', handleAuthRequest as EventListener);
    return () => {
      window.removeEventListener('request-dashboard-auth', handleAuthRequest as EventListener);
    };
  }, []);

  const handleStartApp = () => {
    setManualStateChange(true);
    if (user) {
      setDashboardState('app');
    } else {
      setDashboardState('auth-required');
    }
  };

  const handleTryGuestTimer = () => {
    setManualStateChange(true);
    setDashboardState('guest-timer');
  };

  const handleAuthRequired = () => {
    setManualStateChange(true);
    setDashboardState('auth-required');
  };

  const handleAuthComplete = () => {
    setManualStateChange(false);
  };

  const handleOnboardingComplete = () => {
    setDashboardState('welcome');
  };

  const handleWelcomeComplete = () => {
    if (user) {
      localStorage.setItem(`dashboard-welcome-seen-${user.id}`, 'true');
    }
    setDashboardState('app');
  };

  const handleBackToLanding = () => {
    setManualStateChange(true);
    setDashboardState('landing');
  };

  // Loading state
  if (dashboardState === 'loading' || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Timer className="w-16 h-16 mb-4 text-primary" />
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-muted-foreground">Loading Dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard landing - shown to visitors
  if (dashboardState === 'landing') {
    return (
      <DashboardLanding 
        onStartApp={handleStartApp}
        onTryGuestTimer={handleTryGuestTimer}
        onAuthRequired={handleAuthRequired}
      />
    );
  }

  // Guest timer within dashboard
  if (dashboardState === 'guest-timer') {
    return (
      <DashboardGuestView 
        onAuthRequired={handleAuthRequired}
        onBackToLanding={handleBackToLanding}
      />
    );
  }

  // Authentication flow within dashboard
  if (dashboardState === 'auth-required') {
    return (
      <DashboardAuthView onComplete={handleAuthComplete} />
    );
  }

  // Onboarding for new users
  if (dashboardState === 'onboarding') {
    return (
      <DashboardOnboardingView onComplete={handleOnboardingComplete} />
    );
  }

  // Welcome screen after onboarding
  if (dashboardState === 'welcome') {
    return (
      <DashboardWelcomeView onGetStarted={handleWelcomeComplete} />
    );
  }

  // Full dashboard
  if (dashboardState === 'app') {
    return <Dashboard />;
  }

  return null;
}

// Dashboard Landing Component
function DashboardLanding({ 
  onStartApp, 
  onTryGuestTimer, 
  onAuthRequired 
}: { 
  onStartApp: () => void;
  onTryGuestTimer: () => void;
  onAuthRequired: () => void;
}) {
  const features = [
    { icon: Timer, title: 'Pomodoro Timer', description: 'Focus sessions with breaks', free: true },
    { icon: BarChart3, title: 'Analytics', description: 'Track your productivity', free: false },
    { icon: Target, title: 'Goal Tracking', description: 'Set and achieve goals', free: false },
    { icon: Brain, title: 'AI Assistant', description: 'Productivity coaching', free: false },
    { icon: RefreshCw, title: 'Cloud Sync', description: 'Access anywhere', free: false },
    { icon: Zap, title: 'Advanced Features', description: 'Premium tools', free: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Dashboard Header */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Focus Timer Dashboard</h1>
              <p className="text-sm text-gray-600">Productivity Analytics & Insights</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onAuthRequired}>
              Sign In
            </Button>
            <Button onClick={onStartApp} className="bg-blue-600 hover:bg-blue-700">
              Get Full Access
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Your Productivity Command Center
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Track your focus sessions, analyze productivity patterns, and achieve your goals 
            with our comprehensive dashboard.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button 
              size="lg" 
              onClick={onTryGuestTimer}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
            >
              <Play className="w-5 h-5 mr-2" />
              Try Dashboard Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={onStartApp}
              className="text-lg px-8 py-4 border-blue-200 hover:bg-blue-50"
            >
              Sign Up for Full Access
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onAuthRequired}
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Sign In Here
            </button>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="relative border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <Badge 
                      variant={feature.free ? "default" : "secondary"}
                      className={feature.free ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                    >
                      {feature.free ? "Free" : "Pro"}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                  {!feature.free && (
                    <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-[1px] rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button size="sm" onClick={onStartApp}>
                        <Lock className="w-4 h-4 mr-2" />
                        Unlock
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Dashboard Guest View
function DashboardGuestView({ 
  onAuthRequired, 
  onBackToLanding 
}: { 
  onAuthRequired: () => void;
  onBackToLanding: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      {/* Guest Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Timer className="w-8 h-8 text-primary" />
            <div>
              <span className="font-semibold">Focus Timer Dashboard</span>
              <Badge className="ml-2 bg-orange-100 text-orange-800">Guest Mode</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBackToLanding}>
              ← Back to Home
            </Button>
            <Button variant="ghost" size="sm" onClick={onAuthRequired}>
              Sign In
            </Button>
            <Button size="sm" onClick={onAuthRequired}>
              Sign Up for Full Access
            </Button>
          </div>
        </div>
      </div>

      {/* Guest Dashboard Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-orange-600 mt-1" />
              <div>
                <h4 className="font-medium text-orange-800 mb-1">
                  Dashboard Guest Mode
                </h4>
                <p className="text-sm text-orange-700 mb-3">
                  You're viewing a limited dashboard. Sign up to unlock analytics, 
                  goal tracking, cloud sync, and AI insights.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={onAuthRequired}>
                    Create Free Account
                  </Button>
                  <Button variant="outline" size="sm" onClick={onAuthRequired}>
                    Sign In
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Timer in Dashboard Context */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FocusTimer isCompact={false} />
          </div>
          <div className="space-y-6">
            {/* Locked Features Preview */}
            <DashboardFeaturePreview 
              title="Analytics Dashboard"
              description="Track your productivity patterns"
              onUpgrade={onAuthRequired}
            />
            <DashboardFeaturePreview 
              title="Goal Tracking"
              description="Set and achieve daily goals"
              onUpgrade={onAuthRequired}
            />
            <DashboardFeaturePreview 
              title="AI Assistant"
              description="Get personalized coaching"
              onUpgrade={onAuthRequired}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Auth View
function DashboardAuthView({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Timer className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Your Dashboard</h2>
            <p className="text-gray-600">Sign in or create an account to unlock all features</p>
          </div>
          <AuthFlow onComplete={onComplete} />
        </div>
      </div>
    </div>
  );
}

// Dashboard Onboarding View
function DashboardOnboardingView({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <OnboardingWizard onComplete={onComplete} />
    </div>
  );
}

// Dashboard Welcome View
function DashboardWelcomeView({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <WelcomeScreen onGetStarted={onGetStarted} />
    </div>
  );
}

// Feature Preview Component
function DashboardFeaturePreview({ 
  title, 
  description, 
  onUpgrade 
}: { 
  title: string;
  description: string;
  onUpgrade: () => void;
}) {
  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="opacity-50">
          <h3 className="font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="text-center">
            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <Button size="sm" onClick={onUpgrade}>
              Unlock Feature
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}