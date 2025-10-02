import React from 'react';
import { Button } from '@/components/ui/button';
import { Timer, Play, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStartApp: () => void;
  onTryGuestTimer: () => void;
  onAuthRequired: () => void;
}

export function LandingPage({ onStartApp, onTryGuestTimer, onAuthRequired }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Focus Timer</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onAuthRequired} className="hover:bg-blue-50">
              Sign In
            </Button>
            <Button onClick={onStartApp} className="bg-blue-600 hover:bg-blue-700">
              Get Started Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Master Your Focus,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Achieve Your Goals
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Transform your productivity with the world's most intelligent focus timer. 
            Start with our free Pomodoro timer, then unlock AI-powered insights to reach your full potential.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              onClick={onTryGuestTimer}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4 h-auto"
            >
              <Play className="w-5 h-5 mr-2" />
              Try Free Timer Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={onStartApp}
              className="text-lg px-8 py-4 h-auto border-blue-200 hover:bg-blue-50"
            >
              Sign Up for Full Access
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <div className="text-center mb-12">
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
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Join thousands of users who've already mastered their focus. 
            Start with our free timer or unlock the full experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={onTryGuestTimer}
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 h-auto"
            >
              <Play className="w-5 h-5 mr-2" />
              Try Free Timer
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={onStartApp}
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 h-auto"
            >
              Get Full Access Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}