import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  Timer, 
  Target, 
  BarChart3, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Coffee,
  Clock,
  Zap,
  Trophy
} from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const { user } = useAuth();
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Timer,
      title: 'Pomodoro Timer',
      description: 'Customizable focus sessions with automatic break reminders',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Set and achieve daily, weekly, and monthly productivity goals',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track your productivity patterns and celebrate achievements',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Coffee,
      title: 'Smart Breaks',
      description: 'Mindful break reminders to keep you refreshed and focused',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  const quickActions = [
    {
      icon: Clock,
      title: 'Start Your First Session',
      description: 'Begin with a 25-minute focus session',
      action: 'start-timer',
    },
    {
      icon: Target,
      title: 'Create Your First Goal',
      description: 'Set a productivity goal to work towards',
      action: 'create-goal',
    },
    {
      icon: Zap,
      title: 'Explore Features',
      description: 'Take a tour of all available features',
      action: 'feature-tour',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src="/logo.svg" alt="Focus Timer" className="w-16 h-16" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome to Focus Timer!
              </h1>
              <p className="text-muted-foreground">
                Hello {user?.user_metadata?.full_name || 'there'}! Let's boost your productivity together.
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-muted-foreground">
              Account setup complete
            </span>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Key Features
              </CardTitle>
              <CardDescription>
                Everything you need for productive focus sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                      currentFeature === index ? feature.bgColor : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setCurrentFeature(index)}
                  >
                    <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Quick Start Actions
              </CardTitle>
              <CardDescription>
                Get started with these recommended actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      // Handle quick action
                      onGetStarted();
                    }}
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <action.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{action.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips & Getting Started */}
        <Card className="glass mb-8">
          <CardHeader>
            <CardTitle>Pro Tips for Success</CardTitle>
            <CardDescription>
              Make the most of your Focus Timer experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                    1
                  </Badge>
                  <h4 className="font-medium text-sm">Start Small</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Begin with shorter sessions (15-20 minutes) if you're new to the Pomodoro Technique.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                    2
                  </Badge>
                  <h4 className="font-medium text-sm">Eliminate Distractions</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Turn off notifications and create a dedicated workspace for maximum focus.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                    3
                  </Badge>
                  <h4 className="font-medium text-sm">Track Progress</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Review your analytics regularly to identify your most productive times.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Start Your Productivity Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            You can always access this welcome screen from the help menu
          </p>
        </div>
      </div>
    </div>
  );
}