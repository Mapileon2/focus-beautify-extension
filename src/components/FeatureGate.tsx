import React from 'react';
import { Lock, Zap, BarChart3, Target, RefreshCw, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface FeatureGateProps {
  children: React.ReactNode;
  feature: 'tasks' | 'analytics' | 'goals' | 'sync' | 'ai' | 'advanced';
  className?: string;
}

const featureConfig = {
  tasks: {
    icon: Lock,
    title: 'Task Management',
    description: 'Create, organize, and track your tasks',
    benefits: ['Unlimited tasks', 'Task categories', 'Priority levels', 'Due dates']
  },
  analytics: {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track your productivity with detailed insights',
    benefits: ['Session analytics', 'Productivity trends', 'Goal progress', 'Weekly reports']
  },
  goals: {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Set and achieve your productivity goals',
    benefits: ['Daily goals', 'Weekly targets', 'Progress tracking', 'Achievement badges']
  },
  sync: {
    icon: RefreshCw,
    title: 'Cross-Device Sync',
    description: 'Access your data from anywhere',
    benefits: ['Cloud backup', 'Multi-device access', 'Real-time sync', 'Data export']
  },
  ai: {
    icon: Brain,
    title: 'AI Assistant',
    description: 'Get personalized productivity coaching',
    benefits: ['Smart suggestions', 'Productivity tips', 'Goal recommendations', 'Chat support']
  },
  advanced: {
    icon: Zap,
    title: 'Advanced Features',
    description: 'Unlock the full potential of Focus Timer',
    benefits: ['Custom timer settings', 'Advanced analytics', 'Export data', 'Priority support']
  }
};

export function FeatureGate({ children, feature, className = '' }: FeatureGateProps) {
  const { user } = useAuth();
  
  // If user is authenticated, show the feature
  if (user) {
    return <>{children}</>;
  }

  const config = featureConfig[feature];
  const Icon = config.icon;

  const handleSignUp = () => {
    console.log('FeatureGate: handleSignUp clicked for feature:', feature);
    
    // Try multiple approaches to trigger auth
    
    // Method 1: Direct global function (most reliable)
    if ((window as any).triggerAuth) {
      console.log('FeatureGate: Using global triggerAuth function');
      (window as any).triggerAuth();
      return;
    }
    
    // Method 2: Custom event (primary)
    const event = new CustomEvent('request-auth', { detail: { feature } });
    console.log('FeatureGate: Dispatching event:', event);
    window.dispatchEvent(event);
    
    // Method 3: Direct state manipulation (fallback)
    setTimeout(() => {
      console.log('FeatureGate: Fallback - trying direct navigation');
      // If event doesn't work, try direct approach
      const appRouterEvent = new CustomEvent('force-auth-state', { detail: { feature } });
      window.dispatchEvent(appRouterEvent);
    }, 100);
    
    // Method 4: URL hash change (last resort)
    setTimeout(() => {
      console.log('FeatureGate: Last resort - URL hash change');
      if (window.location.hash !== '#auth') {
        window.location.hash = '#auth';
      }
    }, 200);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Blurred/disabled content */}
      <div className="pointer-events-none opacity-30 blur-sm">
        {children}
      </div>
      
      {/* Feature gate overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm border-2 border-dashed border-blue-300 rounded-lg">
        <div className="text-center p-6 max-w-sm">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Icon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {config.title}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {config.description}
          </p>
          
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">What you'll get:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {config.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          
          <button
            onClick={handleSignUp}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 mb-3"
          >
            Sign Up for Free Access
          </button>
          
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">
              No credit card required • Free forever
            </p>
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={handleSignUp}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Predefined feature gates for common use cases
export function TaskManagementGate({ children, className }: { children: React.ReactNode; className?: string }) {
  return <FeatureGate feature="tasks" className={className}>{children}</FeatureGate>;
}

export function AnalyticsGate({ children, className }: { children: React.ReactNode; className?: string }) {
  return <FeatureGate feature="analytics" className={className}>{children}</FeatureGate>;
}

export function GoalsGate({ children, className }: { children: React.ReactNode; className?: string }) {
  return <FeatureGate feature="goals" className={className}>{children}</FeatureGate>;
}

export function SyncGate({ children, className }: { children: React.ReactNode; className?: string }) {
  return <FeatureGate feature="sync" className={className}>{children}</FeatureGate>;
}

export function AIGate({ children, className }: { children: React.ReactNode; className?: string }) {
  return <FeatureGate feature="ai" className={className}>{children}</FeatureGate>;
}

export function AdvancedGate({ children, className }: { children: React.ReactNode; className?: string }) {
  return <FeatureGate feature="advanced" className={className}>{children}</FeatureGate>;
}