import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/userService';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { OnboardingWizard } from './OnboardingWizard';
import { UserProfileCreator } from './UserProfileCreator';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

type AuthFlowState = 
  | 'loading'
  | 'login' 
  | 'signup' 
  | 'onboarding' 
  | 'profile-setup'
  | 'complete';

interface AuthFlowProps {
  onComplete?: () => void;
}

export function AuthFlow({ onComplete }: AuthFlowProps) {
  const { user, loading: authLoading } = useAuth();
  const [flowState, setFlowState] = useState<AuthFlowState>('loading');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (authLoading) return;

      if (!user) {
        // Check if user has a preference for signup vs login
        const preference = localStorage.getItem('auth-flow-preference');
        setFlowState(preference === 'signup' ? 'signup' : 'login');
        return;
      }

      try {
        // Check if user profile exists
        const profile = await UserService.getUserProfile(user.id);
        setUserProfile(profile);

        if (!profile) {
          // No profile exists - need onboarding
          setFlowState('onboarding');
        } else if (!profile.onboarding_completed) {
          // Profile exists but onboarding not completed
          setFlowState('onboarding');
        } else {
          // Profile exists and onboarding completed
          setFlowState('complete');
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        // If there's an error, assume we need to create profile
        setFlowState('profile-setup');
      }
    };

    checkUserStatus();
  }, [user, authLoading]);

  const handleSignUpSuccess = () => {
    // After successful signup, user will be authenticated
    // The useEffect will handle the next step
  };

  const handleOnboardingComplete = () => {
    setFlowState('complete');
    onComplete?.();
  };

  const handleSwitchToSignUp = () => {
    localStorage.setItem('auth-flow-preference', 'signup');
    setFlowState('signup');
  };

  const handleSwitchToLogin = () => {
    localStorage.setItem('auth-flow-preference', 'login');
    setFlowState('login');
  };

  // Loading state
  if (flowState === 'loading' || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <img src="/logo.svg" alt="Focus Timer" className="w-16 h-16 mb-4" />
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authentication complete - user is ready to use the app
  if (flowState === 'complete') {
    onComplete?.();
    return null; // Let the main app render
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {flowState === 'login' && (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md space-y-6">
            {/* Auth Options Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
              <p className="text-gray-600">Sign in to access your productivity dashboard</p>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setFlowState('login')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  flowState === 'login' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">Sign In</div>
                <div className="text-sm text-gray-500">Existing user</div>
              </button>
              <button
                onClick={handleSwitchToSignUp}
                className="p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="font-medium">Sign Up</div>
                <div className="text-sm text-gray-500">New user</div>
              </button>
            </div>

            <LoginForm />
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  onClick={handleSwitchToSignUp}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up for free
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {flowState === 'signup' && (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md space-y-6">
            {/* Auth Options Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Focus Timer</h2>
              <p className="text-gray-600">Create your account and boost your productivity</p>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={handleSwitchToLogin}
                className="p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="font-medium">Sign In</div>
                <div className="text-sm text-gray-500">Existing user</div>
              </button>
              <button
                onClick={() => setFlowState('signup')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  flowState === 'signup' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">Sign Up</div>
                <div className="text-sm text-gray-500">New user</div>
              </button>
            </div>

            <SignUpForm
              onSuccess={handleSignUpSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          </div>
        </div>
      )}

      {flowState === 'onboarding' && (
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      )}

      {flowState === 'profile-setup' && (
        <div className="flex items-center justify-center min-h-screen p-4">
          <UserProfileCreator />
        </div>
      )}
    </div>
  );
}