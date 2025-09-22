import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TimerSettingsProps {
  settings: {
    focusTime: number;
    breakTime: number;
    longBreakTime: number;
    sessionsUntilLongBreak: number;
  };
  onSettingsChange: (settings: any) => void;
  onClose: () => void;
}

export function TimerSettings({ settings, onSettingsChange, onClose }: TimerSettingsProps) {
  const [tempSettings, setTempSettings] = useState({
    focusTime: Math.floor(settings.focusTime / 60),
    breakTime: Math.floor(settings.breakTime / 60),
    longBreakTime: Math.floor(settings.longBreakTime / 60),
    sessionsUntilLongBreak: settings.sessionsUntilLongBreak,
  });

  const handleSave = () => {
    onSettingsChange({
      focusTime: tempSettings.focusTime * 60,
      breakTime: tempSettings.breakTime * 60,
      longBreakTime: tempSettings.longBreakTime * 60,
      sessionsUntilLongBreak: tempSettings.sessionsUntilLongBreak,
    });
    onClose();
  };

  const handleInputChange = (field: string, value: number) => {
    setTempSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="glass w-full max-w-md p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Timer Settings</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="focusTime" className="text-foreground">
              Focus Time (minutes)
            </Label>
            <Input
              id="focusTime"
              type="number"
              min="1"
              max="60"
              value={tempSettings.focusTime}
              onChange={(e) => handleInputChange('focusTime', parseInt(e.target.value) || 25)}
              className="glass"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="breakTime" className="text-foreground">
              Short Break (minutes)
            </Label>
            <Input
              id="breakTime"
              type="number"
              min="1"
              max="30"
              value={tempSettings.breakTime}
              onChange={(e) => handleInputChange('breakTime', parseInt(e.target.value) || 5)}
              className="glass"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longBreakTime" className="text-foreground">
              Long Break (minutes)
            </Label>
            <Input
              id="longBreakTime"
              type="number"
              min="5"
              max="60"
              value={tempSettings.longBreakTime}
              onChange={(e) => handleInputChange('longBreakTime', parseInt(e.target.value) || 15)}
              className="glass"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionsUntilLongBreak" className="text-foreground">
              Sessions until Long Break
            </Label>
            <Input
              id="sessionsUntilLongBreak"
              type="number"
              min="2"
              max="8"
              value={tempSettings.sessionsUntilLongBreak}
              onChange={(e) => handleInputChange('sessionsUntilLongBreak', parseInt(e.target.value) || 4)}
              className="glass"
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="timer" onClick={handleSave} className="flex-1">
            Save Settings
          </Button>
        </div>
      </Card>
    </div>
  );
}