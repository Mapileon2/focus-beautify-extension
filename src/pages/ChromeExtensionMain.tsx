import React from 'react';
import { FocusTimer } from '@/components/FocusTimer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LayoutDashboard, Settings, BarChart3 } from 'lucide-react';

export function ChromeExtensionMain() {
  const openDashboard = () => {
    // For Chrome extension, this would open the full dashboard in a new tab
    if (typeof window !== 'undefined' && (window as any).chrome?.tabs) {
      (window as any).chrome.tabs.create({ url: (window as any).chrome.runtime.getURL('dashboard.html') });
    } else {
      // For web development, navigate to dashboard route
      window.open('/dashboard', '_blank');
    }
  };

  const openFullApp = () => {
    // For Chrome extension, this would open the full app in a new tab
    if (typeof window !== 'undefined' && (window as any).chrome?.tabs) {
      (window as any).chrome.tabs.create({ url: (window as any).chrome.runtime.getURL('fullapp.html') });
    } else {
      // For web development, navigate to full app route
      window.open('/fullapp', '_blank');
    }
  };

  return (
    <div className="w-[380px] h-[600px] bg-gradient-to-br from-background to-background-secondary">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Focus Timer</h1>
            <p className="text-xs text-muted-foreground">Stay productive with Pomodoro</p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={openDashboard}
              className="h-8 w-8 p-0"
              title="Open Dashboard"
            >
              <LayoutDashboard className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openFullApp}
              className="h-8 w-8 p-0"
              title="Open Full App"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Compact Timer Interface */}
      <div className="p-4">
        <FocusTimer isCompact={true} />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border/50">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openDashboard}
            className="h-8 text-xs"
          >
            <LayoutDashboard className="mr-1 h-3 w-3" />
            Dashboard
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openFullApp}
            className="h-8 text-xs"
          >
            <BarChart3 className="mr-1 h-3 w-3" />
            Analytics
          </Button>
        </div>
      </div>
    </div>
  );
}