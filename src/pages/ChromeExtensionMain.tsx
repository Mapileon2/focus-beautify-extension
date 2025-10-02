import React, { useEffect, useState } from 'react';
import { FocusTimer } from '@/components/FocusTimer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, BarChart3, Database, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { testSupabaseConnection } from '@/utils/supabaseTest';
import { quickStorageTest } from '@/utils/storageTest';

export function ChromeExtensionMain() {
  const { user, loading } = useAuth();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Test both connection and storage
        const [isConnected, storageWorking] = await Promise.all([
          testSupabaseConnection(),
          quickStorageTest()
        ]);
        
        if (isConnected && storageWorking) {
          setBackendStatus('connected');
        } else if (isConnected) {
          setBackendStatus('disconnected'); // Connected but storage issues
        } else {
          setBackendStatus('disconnected');
        }
      } catch (error) {
        setBackendStatus('disconnected');
      }
    };
    checkBackend();
  }, []);

  const openDashboard = () => {
    // For Chrome extension, this would open the full dashboard in a new tab
    if (typeof window !== 'undefined' && (window as any).chrome?.tabs) {
      (window as any).chrome.tabs.create({ url: (window as any).chrome.runtime.getURL('dashboard.html') });
    } else {
      // For web development, navigate to dashboard route
      window.location.href = '/dashboard';
    }
  };

  const openFullApp = () => {
    // For Chrome extension, this would open the full app in a new tab
    if (typeof window !== 'undefined' && (window as any).chrome?.tabs) {
      (window as any).chrome.tabs.create({ url: (window as any).chrome.runtime.getURL('fullapp.html') });
    } else {
      // For web development, navigate to full app route
      window.location.href = '/fullapp';
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
        
        {/* Status Bar */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
          <div className="flex items-center space-x-2">
            {backendStatus === 'connected' ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : backendStatus === 'disconnected' ? (
              <WifiOff className="h-3 w-3 text-red-500" />
            ) : (
              <Database className="h-3 w-3 text-yellow-500 animate-pulse" />
            )}
            <span className="text-xs text-muted-foreground">
              {backendStatus === 'connected' ? 'Backend Connected' : 
               backendStatus === 'disconnected' ? 'Backend Offline' : 'Checking...'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {user ? (
              <Badge variant="default" className="text-xs px-2 py-0">
                {user.email?.split('@')[0]}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs px-2 py-0">
                Not signed in
              </Badge>
            )}
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