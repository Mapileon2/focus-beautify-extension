import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TimerCircle } from './TimerCircle';
import { TimerSettings } from './TimerSettings';
import { SessionStats } from './SessionStats';
import { TaskList } from './TaskList';
import SmilePopup from './SmilePopup';
import { useToast } from '@/hooks/use-toast';

export type TimerMode = 'focus' | 'break' | 'longBreak';

interface FocusTimerProps {
  isCompact?: boolean;
}

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  mode: TimerMode;
  currentSession: number;
  totalSessions: number;
}

interface TimerSettings {
  focusTime: number;
  breakTime: number;
  longBreakTime: number;
  sessionsUntilLongBreak: number;
}

export function FocusTimer({ isCompact = false }: FocusTimerProps) {
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [showSmilePopup, setShowSmilePopup] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>({
    focusTime: 25 * 60, // 25 minutes
    breakTime: 5 * 60,  // 5 minutes
    longBreakTime: 15 * 60, // 15 minutes
    sessionsUntilLongBreak: 4,
  });

  const [timer, setTimer] = useState<TimerState>({
    timeLeft: settings.focusTime,
    isRunning: false,
    mode: 'focus',
    currentSession: 1,
    totalSessions: 0,
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerDuration = (mode: TimerMode): number => {
    switch (mode) {
      case 'focus': return settings.focusTime;
      case 'break': return settings.breakTime;
      case 'longBreak': return settings.longBreakTime;
      default: return settings.focusTime;
    }
  };

  const getModeTitle = (mode: TimerMode): string => {
    switch (mode) {
      case 'focus': return 'Focus Time';
      case 'break': return 'Short Break';
      case 'longBreak': return 'Long Break';
      default: return 'Focus Time';
    }
  };

  const getModeVariant = (mode: TimerMode) => {
    switch (mode) {
      case 'focus': return 'timer';
      case 'break': 
      case 'longBreak': 
        return 'break';
      default: return 'timer';
    }
  };

  const toggleTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const resetTimer = () => {
    setTimer(prev => ({
      ...prev,
      timeLeft: getTimerDuration(prev.mode),
      isRunning: false,
    }));
  };

  const nextSession = () => {
    let nextMode: TimerMode;
    let nextSession = timer.currentSession;
    
    if (timer.mode === 'focus') {
      // Completed a focus session
      const completedSessions = timer.totalSessions + 1;
      if (completedSessions % settings.sessionsUntilLongBreak === 0) {
        nextMode = 'longBreak';
      } else {
        nextMode = 'break';
      }
      
      setTimer(prev => ({
        ...prev,
        mode: nextMode,
        timeLeft: getTimerDuration(nextMode),
        isRunning: false,
        totalSessions: completedSessions,
      }));

      toast({
        title: "🎉 Focus session completed!",
        description: `Great work! Time for a ${nextMode === 'longBreak' ? 'long' : 'short'} break.`,
      });
    } else {
      // Completed a break
      nextMode = 'focus';
      nextSession = timer.currentSession + 1;
      
      setTimer(prev => ({
        ...prev,
        mode: nextMode,
        timeLeft: getTimerDuration(nextMode),
        isRunning: false,
        currentSession: nextSession,
      }));

      toast({
        title: "🔥 Break's over!",
        description: "Ready to focus again? Let's get productive!",
      });
    }
  };

  const handleSkipBreak = () => {
    nextSession();
  };

  const handleStartBreak = () => {
    nextSession();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timer.isRunning && timer.timeLeft > 0) {
      interval = setInterval(() => {
        setTimer(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (timer.timeLeft === 0) {
      setShowSmilePopup(true);
    }

    return () => clearInterval(interval);
  }, [timer.isRunning, timer.timeLeft]);

  const progress = ((getTimerDuration(timer.mode) - timer.timeLeft) / getTimerDuration(timer.mode)) * 100;

  if (isCompact) {
    return (
      <div className="space-y-4">
        {/* Compact Timer Display */}
        <div className="text-center">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            {getModeTitle(timer.mode)}
          </h2>
          <div className="mb-4">
            <TimerCircle
              timeLeft={timer.timeLeft}
              totalTime={getTimerDuration(timer.mode)}
              mode={timer.mode}
              isRunning={timer.isRunning}
              size="sm"
            />
          </div>
          <div className="timer-display-compact text-foreground mb-4">
            {formatTime(timer.timeLeft)}
          </div>
          <Progress value={progress} className="h-1 mb-4" />
        </div>

        {/* Compact Controls */}
        <div className="flex justify-center gap-2">
          <Button
            variant={getModeVariant(timer.mode)}
            size="sm"
            onClick={toggleTimer}
            className="min-w-20"
          >
            {timer.isRunning ? (
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
            onClick={resetTimer}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>

        {/* Compact Session Info */}
        <div className="text-center text-xs text-muted-foreground">
          Session {timer.currentSession} • {timer.totalSessions} completed
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <TimerSettings
            settings={settings}
            onSettingsChange={setSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Smile Popup */}
        <SmilePopup
          isOpen={showSmilePopup}
          onClose={() => setShowSmilePopup(false)}
          onSkipBreak={handleSkipBreak}
          onStartBreak={handleStartBreak}
          sessionType={timer.mode}
          sessionCount={timer.totalSessions}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-light tracking-tight text-foreground">
            Focus Timer
          </h1>
          <p className="text-muted-foreground">
            Stay productive with the Pomodoro Technique
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Timer Section */}
          <div className="lg:col-span-2">
            <Card className="glass p-8 text-center">
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-medium text-foreground">
                  {getModeTitle(timer.mode)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Session {timer.currentSession} • {timer.totalSessions} completed
                </p>
              </div>

              {/* Timer Circle */}
              <div className="mb-8 flex justify-center">
                <TimerCircle
                  timeLeft={timer.timeLeft}
                  totalTime={getTimerDuration(timer.mode)}
                  mode={timer.mode}
                  isRunning={timer.isRunning}
                />
              </div>

              {/* Timer Display */}
              <div className="mb-8">
                <div className="timer-display text-center text-foreground">
                  {formatTime(timer.timeLeft)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <Progress value={progress} className="h-2" />
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center gap-4">
                <Button
                  variant={getModeVariant(timer.mode)}
                  size="lg"
                  onClick={toggleTimer}
                  className="min-w-32"
                >
                  {timer.isRunning ? (
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
                  onClick={resetTimer}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </Card>

            {/* Session Stats */}
            <div className="mt-8">
              <SessionStats
                currentSession={timer.currentSession}
                totalSessions={timer.totalSessions}
                mode={timer.mode}
              />
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1">
            <TaskList />
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <TimerSettings
            settings={settings}
            onSettingsChange={setSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Smile Popup */}
        <SmilePopup
          isOpen={showSmilePopup}
          onClose={() => setShowSmilePopup(false)}
          onSkipBreak={handleSkipBreak}
          onStartBreak={handleStartBreak}
          sessionType={timer.mode}
          sessionCount={timer.totalSessions}
        />
      </div>
    </div>
  );
}