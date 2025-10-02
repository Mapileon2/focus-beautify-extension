import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TimerCircle } from './TimerCircle';
import { MiniTimerSettings } from './MiniTimerSettings';
import { SessionStats } from './SessionStats';
import { TaskList } from './TaskList';
import { TaskManagementGate } from './FeatureGate';
import { DashboardTaskManagementGate } from './DashboardFeatureGate';
import SmilePopup from './SmilePopup';
import { useToast } from '@/hooks/use-toast';
import { useSmilePopupSettings } from '@/hooks/useChromeStorage';
import { useOfflineTimerState } from '@/hooks/useOfflineTimerState';
import { useAuth } from '@/hooks/useAuth';
import '@/utils/timerDebug'; // Load debug utilities

export type TimerMode = 'focus' | 'short_break' | 'long_break';

interface FocusTimerProps {
  isCompact?: boolean;
}

export function FocusTimer({ isCompact = false }: FocusTimerProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showSmilePopup, setShowSmilePopup] = useState(false);
  
  // Get smile popup settings from Chrome storage
  const { value: smilePopupSettings } = useSmilePopupSettings();
  
  // Use offline-first timer state management
  const {
    currentTime,
    isRunning,
    sessionType,
    currentSession,
    totalSessions,
    progress,
    isLoading,
    startTimer,
    pauseTimer,
    resetTimer,
    switchSessionType,
    completeCurrentSession
  } = useOfflineTimerState();

  // Helper function to get total duration for current session type
  const getTotalDuration = (sessionType: TimerMode): number => {
    const savedSettings = localStorage.getItem('timer_settings');
    let settings = { focusTime: 25, breakTime: 5, longBreakTime: 15 };
    if (savedSettings) {
      try {
        settings = JSON.parse(savedSettings);
      } catch (error) {
        console.error('Failed to parse timer settings:', error);
      }
    }
    switch (sessionType) {
      case 'focus': return settings.focusTime * 60;
      case 'short_break': return settings.breakTime * 60;
      case 'long_break': return settings.longBreakTime * 60;
      default: return 25 * 60;
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeTitle = (mode: TimerMode): string => {
    switch (mode) {
      case 'focus': return 'Focus Time';
      case 'short_break': return 'Short Break';
      case 'long_break': return 'Long Break';
      default: return 'Focus Time';
    }
  };

  const getModeVariant = (mode: TimerMode) => {
    switch (mode) {
      case 'focus': return 'timer';
      case 'short_break': 
      case 'long_break': 
        return 'break';
      default: return 'timer';
    }
  };

  const toggleTimer = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const handleReset = () => {
    resetTimer();
    toast({
      title: "Timer Reset",
      description: "Timer has been reset to the beginning.",
    });
  };

  const handleSkipBreak = () => {
    switchSessionType('focus');
    toast({
      title: "🔥 Break skipped!",
      description: "Ready to focus again? Let's get productive!",
    });
  };

  const handleStartBreak = () => {
    toast({
      title: "🎉 Focus session completed!",
      description: `Great work! Time for a ${sessionType === 'long_break' ? 'long' : 'short'} break.`,
    });
  };

  const handleSettingsChange = (newSettings: any) => {
    console.log('Timer settings changed:', newSettings);
    
    toast({
      title: "Settings Updated",
      description: "Timer settings have been applied successfully!",
    });
    
    // The useOfflineTimerState hook will automatically handle the timer update
    // via the 'timerSettingsChanged' event listener
  };

  const openExternalSmilePopup = () => {
    const width = smilePopupSettings.windowWidth || 400;
    const height = smilePopupSettings.windowHeight || 300;
    
    const left = Math.round((screen.width - width) / 2);
    const top = Math.round((screen.height - height) / 2);
    
    const params = new URLSearchParams({
      sessionType: sessionType,
      sessionCount: totalSessions.toString(),
    });
    
    if (typeof chrome !== 'undefined' && chrome.windows) {
      const url = chrome.runtime.getURL(`smile-popup.html?${params.toString()}`);
      chrome.windows.create({
        url,
        type: 'popup',
        width,
        height,
        left,
        top,
        focused: true,
      });
    } else {
      const url = `/smile-popup?${params.toString()}`;
      window.open(
        url,
        'smilePopup',
        `width=${width},height=${height},left=${left},top=${top},resizable=no`
      );
    }
  };

  // Handle timer completion
  useEffect(() => {
    if (currentTime === 0 && !isRunning) {
      if (smilePopupSettings.enabled && smilePopupSettings.showAsExternalWindow) {
        openExternalSmilePopup();
      } else {
        setShowSmilePopup(true);
      }
      
      if (sessionType === 'focus') {
        handleStartBreak();
      }
    }
  }, [currentTime, isRunning, sessionType]);

  if (isCompact) {
    return (
      <div className="space-y-4">
        <div className="text-center flex flex-col items-center">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            {getModeTitle(sessionType)}
          </h2>
          <div className="mb-4 flex justify-center">
            <TimerCircle
              timeLeft={currentTime}
              totalTime={getTotalDuration(sessionType)}
              mode={sessionType}
              isRunning={isRunning}
              size="sm"
            />
          </div>
          <div className="timer-display-compact text-foreground mb-4 text-center">
            {formatTime(currentTime)}
          </div>
          <div className="w-full">
            <Progress value={progress} className="h-1 mb-4" />
          </div>
        </div>

        <div className="flex justify-center gap-2">
          <Button
            variant={getModeVariant(sessionType)}
            size="sm"
            onClick={toggleTimer}
            disabled={isLoading}
            className="min-w-20"
          >
            {isRunning ? (
              <>
                <Pause className="mr-1 h-3 w-3" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-1 h-3 w-3" />
                Start
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isLoading}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>

          <MiniTimerSettings onSettingsChange={handleSettingsChange} />
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Session {currentSession} • {totalSessions} completed
        </div>

        <SmilePopup
          isOpen={showSmilePopup}
          onClose={() => setShowSmilePopup(false)}
          onSkipBreak={handleSkipBreak}
          onStartBreak={handleStartBreak}
          sessionType={sessionType}
          sessionCount={totalSessions}
          customImage={smilePopupSettings.customImage}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src="/logo.svg" alt="Focus Timer" className="w-16 h-16" />
            <h1 className="text-4xl font-light tracking-tight text-foreground">
              Focus Timer
            </h1>
          </div>
          <p className="text-muted-foreground">
            Stay productive with the Pomodoro Technique
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="glass p-8 text-center">
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-medium text-foreground">
                  {getModeTitle(sessionType)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Session {currentSession} • {totalSessions} completed
                </p>
              </div>

              <div className="mb-8 flex justify-center">
                <TimerCircle
                  timeLeft={currentTime}
                  totalTime={getTotalDuration(sessionType)}
                  mode={sessionType}
                  isRunning={isRunning}
                />
              </div>

              <div className="mb-8 flex justify-center">
                <div className="timer-display text-center text-foreground">
                  {formatTime(currentTime)}
                </div>
              </div>

              <div className="mb-8">
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  variant={getModeVariant(sessionType)}
                  size="lg"
                  onClick={toggleTimer}
                  disabled={isLoading}
                  className="min-w-32"
                >
                  {isRunning ? (
                    <>
                      <Pause className="mr-2 h-5 w-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Start
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>

                <div className="flex items-center">
                  <MiniTimerSettings onSettingsChange={handleSettingsChange} />
                </div>
              </div>
            </Card>

            <div className="mt-8">
              <SessionStats
                currentSession={currentSession}
                totalSessions={totalSessions}
                mode={sessionType}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            {/* Only show TaskList with gates in web contexts, not in extension */}
            {isCompact ? (
              // Extension mode - no task list, keep it simple
              <div className="text-center text-sm text-muted-foreground">
                <p>Click Dashboard for full features</p>
              </div>
            ) : window.location.pathname === '/dashboard' ? (
              // Dashboard context - use dashboard gates
              <DashboardTaskManagementGate>
                <TaskList />
              </DashboardTaskManagementGate>
            ) : (
              // Web app context - use regular gates
              <TaskManagementGate>
                <TaskList />
              </TaskManagementGate>
            )}
          </div>
        </div>

        <SmilePopup
          isOpen={showSmilePopup}
          onClose={() => setShowSmilePopup(false)}
          onSkipBreak={handleSkipBreak}
          onStartBreak={handleStartBreak}
          sessionType={sessionType}
          sessionCount={totalSessions}
          customImage={smilePopupSettings.customImage}
        />
      </div>
    </div>
  );
}