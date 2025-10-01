import React, { useState, useEffect } from 'react';
import { Settings, RotateCcw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface MiniTimerSettingsProps {
  onSettingsChange?: (settings: any) => void;
}

export function MiniTimerSettings({ onSettingsChange }: MiniTimerSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState({
    focusTime: 25,
    breakTime: 5,
    longBreakTime: 15,
    sessionsUntilLongBreak: 4,
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('timer_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setTempSettings({
          focusTime: parsed.focusTime || 25,
          breakTime: parsed.breakTime || 5,
          longBreakTime: parsed.longBreakTime || 15,
          sessionsUntilLongBreak: parsed.sessionsUntilLongBreak || 4,
        });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const handleSave = () => {
    // Validate and ensure all values are positive numbers
    const validSettings = {
      focusTime: Math.max(1, Math.min(120, tempSettings.focusTime || 25)),
      breakTime: Math.max(1, Math.min(30, tempSettings.breakTime || 5)),
      longBreakTime: Math.max(5, Math.min(60, tempSettings.longBreakTime || 15)),
      sessionsUntilLongBreak: Math.max(2, Math.min(8, tempSettings.sessionsUntilLongBreak || 4)),
    };
    
    // Update state with validated settings
    setTempSettings(validSettings);
    
    // Save to localStorage (offline-only)
    localStorage.setItem('timer_settings', JSON.stringify(validSettings));
    
    // Convert to seconds for timer
    const newSettings = {
      focusTime: validSettings.focusTime * 60,
      breakTime: validSettings.breakTime * 60,
      longBreakTime: validSettings.longBreakTime * 60,
      sessionsUntilLongBreak: validSettings.sessionsUntilLongBreak,
    };

    // Apply settings to timer immediately
    onSettingsChange?.(newSettings);
    
    // Trigger custom event for other components
    window.dispatchEvent(new CustomEvent('timerSettingsChanged', { 
      detail: newSettings 
    }));
    
    toast.success('Timer settings saved!');
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempSettings({
      focusTime: 25,
      breakTime: 5,
      longBreakTime: 15,
      sessionsUntilLongBreak: 4,
    });
    toast.success('Settings reset to defaults');
  };

  const handleInputChange = (field: keyof typeof tempSettings, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    if (!isNaN(numValue)) {
      setTempSettings(prev => ({
        ...prev,
        [field]: numValue,
      }));
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 p-0"
        title="Timer Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Card className="glass p-4 space-y-4 w-full max-w-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Timer Settings</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-6 w-6 p-0"
            title="Reset to defaults"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <Label htmlFor="focusTime" className="text-xs text-muted-foreground">
            Focus (min)
          </Label>
          <Input
            id="focusTime"
            type="number"
            min="1"
            max="120"
            value={tempSettings.focusTime || ''}
            onChange={(e) => handleInputChange('focusTime', e.target.value)}
            onBlur={(e) => {
              // Ensure valid value on blur
              if (!e.target.value || parseInt(e.target.value) < 1) {
                setTempSettings(prev => ({ ...prev, focusTime: 25 }));
              }
            }}
            className="h-7 text-xs"
            placeholder="25"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="breakTime" className="text-xs text-muted-foreground">
            Break (min)
          </Label>
          <Input
            id="breakTime"
            type="number"
            min="1"
            max="30"
            value={tempSettings.breakTime || ''}
            onChange={(e) => handleInputChange('breakTime', e.target.value)}
            onBlur={(e) => {
              // Ensure valid value on blur
              if (!e.target.value || parseInt(e.target.value) < 1) {
                setTempSettings(prev => ({ ...prev, breakTime: 5 }));
              }
            }}
            className="h-7 text-xs"
            placeholder="5"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="longBreakTime" className="text-xs text-muted-foreground">
            Long Break (min)
          </Label>
          <Input
            id="longBreakTime"
            type="number"
            min="5"
            max="60"
            value={tempSettings.longBreakTime || ''}
            onChange={(e) => handleInputChange('longBreakTime', e.target.value)}
            onBlur={(e) => {
              // Ensure valid value on blur
              if (!e.target.value || parseInt(e.target.value) < 5) {
                setTempSettings(prev => ({ ...prev, longBreakTime: 15 }));
              }
            }}
            className="h-7 text-xs"
            placeholder="15"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="sessionsUntilLongBreak" className="text-xs text-muted-foreground">
            Sessions
          </Label>
          <Input
            id="sessionsUntilLongBreak"
            type="number"
            min="2"
            max="8"
            value={tempSettings.sessionsUntilLongBreak || ''}
            onChange={(e) => handleInputChange('sessionsUntilLongBreak', e.target.value)}
            onBlur={(e) => {
              // Ensure valid value on blur
              if (!e.target.value || parseInt(e.target.value) < 2) {
                setTempSettings(prev => ({ ...prev, sessionsUntilLongBreak: 4 }));
              }
            }}
            className="h-7 text-xs"
            placeholder="4"
          />
        </div>
      </div>

      <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-600 dark:text-blue-400">
        Settings saved locally on this device
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsOpen(false)}
          className="flex-1 h-7 text-xs"
        >
          Cancel
        </Button>
        <Button 
          variant="timer" 
          size="sm" 
          onClick={handleSave}
          className="flex-1 h-7 text-xs"
        >
          <Check className="h-3 w-3 mr-1" />
          Save
        </Button>
      </div>
    </Card>
  );
}