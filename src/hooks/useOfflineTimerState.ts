import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useCreateSession, useCompleteSession } from './useSupabaseQueries'

export interface TimerState {
  currentTime: number
  isRunning: boolean
  sessionType: 'focus' | 'short_break' | 'long_break'
  currentSession: number
  totalSessions: number
  currentSessionId: string | null
  lastUpdated: number
}

const DEFAULT_TIMER_STATE: TimerState = {
  currentTime: 25 * 60, // 25 minutes in seconds
  isRunning: false,
  sessionType: 'focus',
  currentSession: 1,
  totalSessions: 0,
  currentSessionId: null,
  lastUpdated: Date.now()
}

/**
 * Offline-first timer state management
 * - Timer settings stored in localStorage
 * - Session tracking synced to database
 * - Handles offline/online scenarios
 */
export function useOfflineTimerState() {
  const { user } = useAuth()
  const createSession = useCreateSession()
  const completeSession = useCompleteSession()

  // Load state from localStorage
  const [timerState, setTimerState] = useState<TimerState>(() => {
    const saved = localStorage.getItem('focus-timer-state');
    if (saved) {
      try {
        const parsedState = { ...DEFAULT_TIMER_STATE, ...JSON.parse(saved) };
        console.log('Loaded timer state from localStorage:', parsedState);
        return parsedState;
      } catch (error) {
        console.error('Failed to parse timer state:', error);
      }
    }
    console.log('Using default timer state:', DEFAULT_TIMER_STATE);
    return DEFAULT_TIMER_STATE;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('focus-timer-state', JSON.stringify(timerState));
  }, [timerState]);

  // Get duration based on session type from localStorage settings
  const getSessionDuration = useCallback((sessionType: TimerState['sessionType']) => {
    const savedSettings = localStorage.getItem('timer_settings');
    let settings = {
      focusTime: 25,
      breakTime: 5,
      longBreakTime: 15,
      sessionsUntilLongBreak: 4
    };

    if (savedSettings) {
      try {
        settings = JSON.parse(savedSettings);
      } catch (error) {
        console.error('Failed to parse timer settings:', error);
      }
    }

    switch (sessionType) {
      case 'focus': return settings.focusTime * 60
      case 'short_break': return settings.breakTime * 60
      case 'long_break': return settings.longBreakTime * 60
    }
  }, [])

  // Start timer with database session creation (if online)
  const startTimer = useCallback(async () => {
    try {
      let sessionId = null;
      
      // Try to create session in database if user is logged in
      if (user) {
        const sessionData = await createSession.mutateAsync({
          user_id: user.id,
          session_type: timerState.sessionType,
          duration_minutes: Math.floor(timerState.currentTime / 60),
          completed: false
        });
        sessionId = sessionData.id;
      }

      setTimerState(prev => ({
        ...prev,
        isRunning: true,
        currentSessionId: sessionId,
        lastUpdated: Date.now()
      }));
    } catch (error) {
      console.error('Failed to create session:', error);
      // Still allow local timer to start
      setTimerState(prev => ({
        ...prev,
        isRunning: true,
        lastUpdated: Date.now()
      }));
    }
  }, [user, timerState.sessionType, timerState.currentTime, createSession]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      lastUpdated: Date.now()
    }));
  }, []);

  // Complete session with database update (if online)
  const completeCurrentSession = useCallback(async () => {
    try {
      // Try to complete session in database if user is logged in and session exists
      if (user && timerState.currentSessionId) {
        await completeSession.mutateAsync(timerState.currentSessionId);
      }
      
      // Get settings for next session
      const savedSettings = localStorage.getItem('timer_settings');
      let settings = { sessionsUntilLongBreak: 4 };
      if (savedSettings) {
        try {
          settings = JSON.parse(savedSettings);
        } catch (error) {
          console.error('Failed to parse timer settings:', error);
        }
      }
      
      // Determine next session type
      const isLongBreakTime = timerState.currentSession % settings.sessionsUntilLongBreak === 0;
      
      let nextSessionType: TimerState['sessionType'];
      if (timerState.sessionType === 'focus') {
        nextSessionType = isLongBreakTime ? 'long_break' : 'short_break';
      } else {
        nextSessionType = 'focus';
      }

      const nextDuration = getSessionDuration(nextSessionType);

      setTimerState(prev => ({
        ...prev,
        currentTime: nextDuration,
        isRunning: false,
        sessionType: nextSessionType,
        currentSession: timerState.sessionType === 'focus' ? prev.currentSession + 1 : prev.currentSession,
        totalSessions: timerState.sessionType === 'focus' ? prev.totalSessions + 1 : prev.totalSessions,
        currentSessionId: null,
        lastUpdated: Date.now()
      }));
    } catch (error) {
      console.error('Failed to complete session:', error);
    }
  }, [user, timerState, completeSession, getSessionDuration]);

  // Reset timer
  const resetTimer = useCallback(() => {
    const duration = getSessionDuration(timerState.sessionType);
    setTimerState(prev => ({
      ...prev,
      currentTime: duration,
      isRunning: false,
      currentSessionId: null,
      lastUpdated: Date.now()
    }));
  }, [timerState.sessionType, getSessionDuration]);

  // Switch session type
  const switchSessionType = useCallback((newType: TimerState['sessionType']) => {
    const duration = getSessionDuration(newType);
    setTimerState(prev => ({
      ...prev,
      sessionType: newType,
      currentTime: duration,
      isRunning: false,
      currentSessionId: null,
      lastUpdated: Date.now()
    }));
  }, [getSessionDuration]);

  // Timer tick effect
  useEffect(() => {
    if (!timerState.isRunning) return;

    const interval = setInterval(() => {
      setTimerState(prev => {
        // Simple countdown - subtract 1 second
        const newTime = Math.max(0, prev.currentTime - 1);

        console.log('Timer tick:', { 
          prevTime: prev.currentTime, 
          newTime, 
          isRunning: prev.isRunning 
        });

        // Auto-complete session when time reaches 0 or gets stuck at 1
        if ((newTime === 0 && prev.currentTime > 0) || (newTime === 1 && prev.currentTime === 1)) {
          console.log('Timer completed, calling completeCurrentSession');
          setTimeout(() => completeCurrentSession(), 0); // Use setTimeout to avoid state update conflicts
          return {
            ...prev,
            currentTime: 0,
            isRunning: false,
            lastUpdated: Date.now()
          };
        }

        return {
          ...prev,
          currentTime: newTime,
          lastUpdated: Date.now()
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState.isRunning, completeCurrentSession]);

  // Listen for settings changes and update timer duration if not running
  useEffect(() => {
    const handleSettingsChange = () => {
      // Only update timer duration if timer is not currently running
      if (!timerState.isRunning) {
        const newDuration = getSessionDuration(timerState.sessionType);
        setTimerState(prev => ({
          ...prev,
          currentTime: newDuration,
          lastUpdated: Date.now()
        }));
      }
    };

    window.addEventListener('timerSettingsChanged', handleSettingsChange);
    
    return () => {
      window.removeEventListener('timerSettingsChanged', handleSettingsChange);
    };
  }, [timerState.isRunning, timerState.sessionType, getSessionDuration]);

  return {
    // State
    ...timerState,
    
    // Actions
    startTimer,
    pauseTimer,
    resetTimer,
    switchSessionType,
    completeCurrentSession,
    
    // Computed values
    progress: (() => {
      const totalDuration = getSessionDuration(timerState.sessionType);
      return totalDuration > 0 
        ? ((totalDuration - timerState.currentTime) / totalDuration) * 100
        : 0;
    })(),
    
    // Status
    isLoading: createSession.isPending || completeSession.isPending
  };
}