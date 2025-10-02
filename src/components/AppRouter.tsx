import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/userService';
import { LandingPage } from './LandingPageSimple';
import { AuthFlow } from './AuthFlow';
import { OnboardingWizard } from './OnboardingWizard';
import { WelcomeScreen } from './WelcomeScreen';
import { FocusTimer } from './FocusTimer';
import { Dashboard } from './Dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

type AppState = 
  | 'landing'           // Show landing page to all visitors
  | 'guest-timer'       // Basic timer for non-authenticated users
  | 'auth-required'     // Show auth flow
  | 'onboarding'        // New user onboarding
  | 'welcome'           // Post-onboarding welcome
  | 'app'               // Full authenticated app
  | 'loading';          // Loading state

export function AppRouter() {
  const { user, loading: authLoading } = useAuth();
  const [appState, setAppState] = useState<AppState>('loading');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showLandingFirst, setShowLandingFirst] = useState(true);
  const [manualStateChange, setManualStateChange] = useState(false);

  console.log('AppRouter render - Current state:', appState, 'User:', user, 'AuthLoading:', authLoading, 'Manual:', manualStateChange);

  // Expose global function for direct access
  useEffect(() => {
    (window as any).triggerAuth = () => {
      console.log('AppRouter: Global triggerAuth called');
      setManualStateChange(true);
      setAppState('auth-required');
    };
    
    return () => {
      delete (window as any).triggerAuth;
    };
  }, []);

  useEffect(() => {
    const checkAppState = async () => {
      // Don't override manual state changes
      if (manualStateChange) {
        console.log('AppRouter: Skipping auto state check due to manual change');
        return;
      }
      
      if (authLoading) return;

      // Check URL parameters for direct routing
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      
      if (mode === 'guest' && !user) {
        console.log('AppRouter: URL parameter requests guest mode');
        setAppState('guest-timer');
        return;
      }
      
      if (mode === 'auth') {
        console.log('AppRouter: URL parameter requests auth');
        setAppState('auth-required');
        return;
      }

      // Check if user has visited before
      const hasVisited = localStorage.getItem('focus-timer-visited');
      
      if (!user) {
        // No user - show landing page or guest timer based on preference
        if (!hasVisited) {
          setAppState('landing');
          localStorage.setItem('focus-timer-visited', 'true');
        } else {
          // Returning visitor without account - show landing
          setAppState('landing');
        }
        return;
      }

      try {
        // User is authenticated - check profile status
        const profile = await UserService.getUserProfile(user.id);
        setUserProfile(profile);

        if (!profile) {
          // No profile - needs onboarding
          setAppState('onboarding');
        } else if (!profile.onboarding_completed) {
          // Profile exists but onboarding not completed
          setAppState('onboarding');
        } else {
          // Check if this is their first login after onboarding
          const hasSeenWelcome = localStorage.getItem(`welcome-seen-${user.id}`);
          if (!hasSeenWelcome) {
            setAppState('welcome');
          } else {
            setAppState('app');
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        setAppState('onboarding');
      }
    };

    checkAppState();
  }, [user, authLoading, manualStateChange]);

  // Listen for feature gate auth requests
  useEffect(() => {
    const handleAuthRequest = (event: CustomEvent) => {
      console.log('AppRouter: Received feature gate auth request:', event.detail);
      console.log('AppRouter: Current state before change:', appState);
      setManualStateChange(true);
      setAppState('auth-required');
      console.log('AppRouter: State changed to auth-required');
    };

    const handleForceAuthState = (event: CustomEvent) => {
      console.log('AppRouter: Received force auth state request:', event.detail);
      setManualStateChange(true);
      setAppState('auth-required');
    };

    const handleHashChange = () => {
      console.log('AppRouter: Hash changed to:', window.location.hash);
      if (window.location.hash === '#auth') {
        console.log('AppRouter: Hash indicates auth needed');
        setManualStateChange(true);
        setAppState('auth-required');
        // Clear the hash
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    console.log('AppRouter: Setting up event listeners');
    window.addEventListener('request-auth', handleAuthRequest as EventListener);
    window.addEventListener('force-auth-state', handleForceAuthState as EventListener);
    window.addEventListener('hashchange', handleHashChange);
    
    // Check initial hash
    handleHashChange();

    return () => {
      console.log('AppRouter: Removing event listeners');
      window.removeEventListener('request-auth', handleAuthRequest as EventListener);
      window.removeEventListener('force-auth-state', handleForceAuthState as EventListener);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []); // Remove appState dependency to prevent re-registration

  const handleStartApp = () => {
    console.log('handleStartApp clicked, user:', user);
    setManualStateChange(true);
    if (user) {
      setAppState('app');
    } else {
      setAppState('auth-required');
    }
  };

  const handleTryGuestTimer = () => {
    console.log('handleTryGuestTimer clicked');
    setManualStateChange(true);
    setAppState('guest-timer');
  };

  const handleAuthRequired = () => {
    console.log('handleAuthRequired clicked');
    setManualStateChange(true);
    setAppState('auth-required');
  };

  const handleAuthComplete = () => {
    // Reset manual state change flag so auto-routing can work
    setManualStateChange(false);
    // After auth, the useEffect will handle routing to onboarding or app
  };

  const handleOnboardingComplete = () => {
    setAppState('welcome');
  };

  const handleWelcomeComplete = () => {
    if (user) {
      localStorage.setItem(`welcome-seen-${user.id}`, 'true');
    }
    setAppState('app');
  };

  const handleBackToLanding = () => {
    setManualStateChange(true);
    setAppState('landing');
  };

  // Loading state
  if (appState === 'loading' || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <img src="/logo.svg" alt="Focus Timer" className="w-16 h-16 mb-4" />
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-muted-foreground">Loading Focus Timer...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Landing page - shown to all new visitors
  if (appState === 'landing') {
    return (
      <LandingPage 
        onStartApp={handleStartApp}
        onTryGuestTimer={handleTryGuestTimer}
        onAuthRequired={handleAuthRequired}
      />
    );
  }

  // Guest timer - basic functionality without account
  if (appState === 'guest-timer') {
    return (
      <GuestTimerView 
        onAuthRequired={handleAuthRequired}
        onBackToLanding={handleBackToLanding}
      />
    );
  }

  // Authentication flow
  if (appState === 'auth-required') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <AuthFlow onComplete={handleAuthComplete} />
      </div>
    );
  }

  // Onboarding for new users
  if (appState === 'onboarding') {
    return (
      <OnboardingWizard onComplete={handleOnboardingComplete} />
    );
  }

  // Welcome screen after onboarding
  if (appState === 'welcome') {
    return (
      <WelcomeScreen onGetStarted={handleWelcomeComplete} />
    );
  }

  // Full authenticated app
  if (appState === 'app') {
    return (
      <AuthenticatedApp />
    );
  }

  return null;
}

// Guest Timer Component - Limited functionality
function GuestTimerView({ 
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
            <img src="/logo.svg" alt="Focus Timer" className="w-8 h-8" />
            <span className="font-semibold">Focus Timer</span>
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
              Guest Mode
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onBackToLanding}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Home
            </button>
            <button
              onClick={onAuthRequired}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline mr-2"
            >
              Sign In
            </button>
            <button
              onClick={onAuthRequired}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90"
            >
              Sign Up for Full Features
            </button>
          </div>
        </div>
      </div>

      {/* Limited Feature Notice */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                  You're in Guest Mode
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                  Enjoy the basic timer! Sign up to unlock task management, analytics, 
                  goal tracking, and sync across devices.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button 
                    onClick={onAuthRequired}
                    className="text-sm text-orange-700 hover:text-orange-800 underline font-medium"
                  >
                    Create free account →
                  </button>
                  <span className="text-sm text-orange-600 hidden sm:inline">•</span>
                  <button 
                    onClick={onAuthRequired}
                    className="text-sm text-orange-700 hover:text-orange-800 underline"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Timer */}
        <FocusTimer isCompact={false} />
      </div>
    </div>
  );
}

// Full Authenticated App
function AuthenticatedApp() {
  return <Dashboard />;
}