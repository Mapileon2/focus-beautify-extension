import React from 'react';
import { Lock, Zap, BarChart3, Target, RefreshCw, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardFeatureGateProps {
  children: React.ReactNode;
  feature: 'tasks' | 'analytics' | 'goals' | 'sync' | 'ai' | 'advanced';
  className?: string;
}

const dashboardFeatureConfig = {
  tasks: {
    icon: Lock,
    title: 'Task Management',
    description: 'Create, organize, and track your tasks within the dashboard',
    benefits: ['Unlimited tasks', 'Task categories', 'Priority levels', 'Due dates', 'Progress tracking']
  },
  analytics: {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Comprehensive productivity insights and detailed analytics',
    benefits: ['Session analytics', 'Productivity trends', 'Goal progress', 'Weekly reports', 'Performance metrics']
  },
  goals: {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Set, track, and achieve your productivity goals',
    benefits: ['Daily goals', 'Weekly targets', 'Progress tracking', 'Achievement badges', 'Milestone rewards']
  },
  sync: {
    icon: RefreshCw,
    title: 'Cloud Synchronization',
    description: 'Access your data from anywhere with cloud sync',
    benefits: ['Cloud backup', 'Multi-device access', 'Real-time sync', 'Data export', 'Offline support']
  },
  ai: {
    icon: Brain,
    title: 'AI Productivity Assistant',
    description: 'Get personalized productivity coaching and insights',
    benefits: ['Smart suggestions', 'Productivity tips', 'Goal recommendations', 'Chat support', 'Custom insights']
  },
  advanced: {
    icon: Zap,
    title: 'Advanced Dashboard Features',
    description: 'Unlock the full potential of your productivity dashboard',
    benefits: ['Custom dashboards', 'Advanced analytics', 'Data export', 'API access', 'Priority support']
  }
};

export function DashboardFeatureGate({ children, feature, className = '' }: DashboardFeatureGateProps) {
  const { user } = useAuth();
  
  // If user is authenticated, show the feature
  if (user) {
    return <>{children}</>;
  }

  const config = dashboardFeatureConfig[feature];
  const Icon = config.icon;

  const handleSignUp = () => {
    console.log('DashboardFeatureGate: handleSignUp clicked for feature:', feature);
    
    // Try dashboard-specific auth trigger
    if ((window as any).triggerDashboardAuth) {
      console.log('DashboardFeatureGate: Using dashboard auth function');
      (window as any).triggerDashboardAuth();
      return;
    }
    
    // Fallback to dashboard auth event
    const event = new CustomEvent('request-dashboard-auth', { detail: { feature } });
    console.log('DashboardFeatureGate: Dispatching dashboard auth event:', event);
    window.dispatchEvent(event);
    
    // Last resort - redirect to dashboard with auth mode
    setTimeout(() => {
      if (window.location.pathname !== '/dashboard') {
        window.location.href = '/dashboard?mode=auth';
      }
    }, 100);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Blurred/disabled content */}
      <div className="pointer-events-none opacity-20 blur-sm">
        {children}
      </div>
      
      {/* Dashboard feature gate overlay */}
      <Card className="absolute inset-0 border-2 border-dashed border-blue-300">
        <CardContent className="flex items-center justify-center h-full p-6">
          <div className="text-center max-w-sm">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Icon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {config.title}
            </h3>
            
            <p className="text-gray-600 mb-4 text-sm">
              {config.description}
            </p>
            
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Unlock to get:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {config.benefits.slice(0, 3).map((benefit, index) => (
                  <li key={index} className="flex items-center justify-center">
                    <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                    {benefit}
                  </li>
                ))}
                {config.benefits.length > 3 && (
                  <li className="text-gray-500">+ {config.benefits.length - 3} more features</li>
                )}
              </ul>
            </div>
            
            <Button
              onClick={handleSignUp}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 mb-3"
              size="sm"
            >
              Unlock Dashboard Feature
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">
                No credit card required • Free forever
              </p>
              <p className="text-xs text-gray-600">
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
        </CardContent>
      </Card>
    </div>
  );
}

// Predefined dashboard feature gates
export function DashboardTaskManagementGate({ children, className }: { children: React.ReactNode; className?: string }) {
  return <DashboardFeatureGate feature="tasks" className={className}>{children}</DashboardFeatureGate>;
}

export function DashboardAnalyticsGate({ children, className }: { children: React.ReactNode; className?: string }) {
  return <DashboardFeatureGate feature="analytics" className={className}>{children}</DashboardFeatureGate>;
}

export function DashboardGoalsGate({ children, className }: { children: React.ReactNode; className?: string }) {
  return <DashboardFeatureGate feature="goals" className={className}>{children}</DashboardFeatureGate>;
}

export function DashboardSyncGate({ children, className }: { children: React.ReactNode; className?: string }) {
  return <DashboardFeatureGate feature="sync" className={className}>{children}</DashboardFeatureGate>;
}

export function DashboardAIGate({ children, className }: { children: React.ReactNode; className?: string }) {
  return <DashboardFeatureGate feature="ai" className={className}>{children}</DashboardFeatureGate>;
}

export function DashboardAdvancedGate({ children, className }: { children: React.ReactNode; className?: string }) {
  return <DashboardFeatureGate feature="advanced" className={className}>{children}</DashboardFeatureGate>;
}