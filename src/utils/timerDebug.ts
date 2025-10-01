// Timer debugging utilities

export function resetTimerState() {
  console.log('🔄 Resetting timer state...');
  
  // Clear localStorage timer state
  localStorage.removeItem('focus-timer-state');
  
  // Set default timer settings
  const defaultSettings = {
    focusTime: 25,
    breakTime: 5,
    longBreakTime: 15,
    sessionsUntilLongBreak: 4
  };
  
  localStorage.setItem('timer_settings', JSON.stringify(defaultSettings));
  
  console.log('✅ Timer state reset to defaults');
  console.log('Settings:', defaultSettings);
  
  // Trigger a page reload to reinitialize
  window.location.reload();
}

export function debugTimerState() {
  console.log('🔍 Timer Debug Information:');
  
  const timerState = localStorage.getItem('focus-timer-state');
  const timerSettings = localStorage.getItem('timer_settings');
  
  console.log('Timer State:', timerState ? JSON.parse(timerState) : 'Not found');
  console.log('Timer Settings:', timerSettings ? JSON.parse(timerSettings) : 'Not found');
  
  return {
    timerState: timerState ? JSON.parse(timerState) : null,
    timerSettings: timerSettings ? JSON.parse(timerSettings) : null
  };
}

export function setTimerTo(minutes: number) {
  console.log(`⏰ Setting timer to ${minutes} minutes for testing...`);
  
  const timerState = {
    currentTime: minutes * 60,
    isRunning: false,
    sessionType: 'focus',
    currentSession: 1,
    totalSessions: 0,
    currentSessionId: null,
    lastUpdated: Date.now()
  };
  
  localStorage.setItem('focus-timer-state', JSON.stringify(timerState));
  
  console.log('✅ Timer set to', minutes, 'minutes');
  
  // Trigger settings change event to update UI
  window.dispatchEvent(new CustomEvent('timerSettingsChanged', { 
    detail: { focusTime: minutes * 60 }
  }));
}

// Make functions available in browser console
if (typeof window !== 'undefined') {
  (window as any).resetTimerState = resetTimerState;
  (window as any).debugTimerState = debugTimerState;
  (window as any).setTimerTo = setTimerTo;
}