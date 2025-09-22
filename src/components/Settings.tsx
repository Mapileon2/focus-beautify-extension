import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Palette, 
  Clock, 
  Volume2, 
  Moon, 
  Sun,
  Monitor,
  Smartphone,
  Download,
  Shield,
  Key
} from 'lucide-react';

export function Settings() {
  const [settings, setSettings] = useState({
    // Timer Settings
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    
    // Notifications
    desktopNotifications: true,
    soundNotifications: true,
    sessionReminders: true,
    breakReminders: true,
    
    // Appearance
    theme: 'dark',
    soundVolume: 70,
    backgroundSounds: false,
    
    // Privacy & Data
    dataCollection: true,
    autoSave: true,
    cloudSync: false,
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const soundOptions = [
    { value: 'bell', label: 'Bell' },
    { value: 'chime', label: 'Chime' },
    { value: 'ping', label: 'Ping' },
    { value: 'none', label: 'None' },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="timer" className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Timer Settings */}
        <TabsContent value="timer" className="space-y-6">
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Clock className="h-5 w-5" />
              Timer Duration
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="focus-duration">Focus Duration (minutes)</Label>
                <Input
                  id="focus-duration"
                  type="number"
                  min="5"
                  max="60"
                  value={settings.focusDuration}
                  onChange={(e) => updateSetting('focusDuration', parseInt(e.target.value))}
                  className="glass"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short-break">Short Break (minutes)</Label>
                <Input
                  id="short-break"
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakDuration}
                  onChange={(e) => updateSetting('shortBreakDuration', parseInt(e.target.value))}
                  className="glass"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long-break">Long Break (minutes)</Label>
                <Input
                  id="long-break"
                  type="number"
                  min="5"
                  max="60"
                  value={settings.longBreakDuration}
                  onChange={(e) => updateSetting('longBreakDuration', parseInt(e.target.value))}
                  className="glass"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessions-until-long">Sessions until Long Break</Label>
                <Input
                  id="sessions-until-long"
                  type="number"
                  min="2"
                  max="8"
                  value={settings.sessionsUntilLongBreak}
                  onChange={(e) => updateSetting('sessionsUntilLongBreak', parseInt(e.target.value))}
                  className="glass"
                />
              </div>
            </div>
          </Card>

          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Auto-Start Options</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Auto-start breaks</p>
                  <p className="text-sm text-muted-foreground">Automatically start breaks when focus sessions end</p>
                </div>
                <Switch
                  checked={settings.autoStartBreaks}
                  onCheckedChange={(checked) => updateSetting('autoStartBreaks', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Auto-start pomodoros</p>
                  <p className="text-sm text-muted-foreground">Automatically start next focus session after breaks</p>
                </div>
                <Switch
                  checked={settings.autoStartPomodoros}
                  onCheckedChange={(checked) => updateSetting('autoStartPomodoros', checked)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Bell className="h-5 w-5" />
              Notification Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Desktop Notifications</p>
                  <p className="text-sm text-muted-foreground">Show browser notifications for session changes</p>
                </div>
                <Switch
                  checked={settings.desktopNotifications}
                  onCheckedChange={(checked) => updateSetting('desktopNotifications', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Sound Notifications</p>
                  <p className="text-sm text-muted-foreground">Play sound when sessions start or end</p>
                </div>
                <Switch
                  checked={settings.soundNotifications}
                  onCheckedChange={(checked) => updateSetting('soundNotifications', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Session Reminders</p>
                  <p className="text-sm text-muted-foreground">Remind me to start scheduled sessions</p>
                </div>
                <Switch
                  checked={settings.sessionReminders}
                  onCheckedChange={(checked) => updateSetting('sessionReminders', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Break Reminders</p>
                  <p className="text-sm text-muted-foreground">Remind me to take breaks</p>
                </div>
                <Switch
                  checked={settings.breakReminders}
                  onCheckedChange={(checked) => updateSetting('breakReminders', checked)}
                />
              </div>
            </div>
          </Card>

          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Volume2 className="h-5 w-5" />
              Sound Settings
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Notification Sound</Label>
                <Select defaultValue="bell">
                  <SelectTrigger className="glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {soundOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Volume: {settings.soundVolume}%</Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.soundVolume}
                  onChange={(e) => updateSetting('soundVolume', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Palette className="h-5 w-5" />
              Theme & Appearance
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  {themes.map(theme => {
                    const Icon = theme.icon;
                    return (
                      <Button
                        key={theme.value}
                        variant={settings.theme === theme.value ? "timer" : "outline"}
                        className="h-12 flex-col gap-1"
                        onClick={() => updateSetting('theme', theme.value)}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{theme.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Background Sounds</p>
                  <p className="text-sm text-muted-foreground">Play ambient sounds during focus sessions</p>
                </div>
                <Switch
                  checked={settings.backgroundSounds}
                  onCheckedChange={(checked) => updateSetting('backgroundSounds', checked)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Privacy & Data */}
        <TabsContent value="privacy" className="space-y-6">
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5" />
              Privacy & Data
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Data Collection</p>
                  <p className="text-sm text-muted-foreground">Allow anonymous usage analytics to improve the app</p>
                </div>
                <Switch
                  checked={settings.dataCollection}
                  onCheckedChange={(checked) => updateSetting('dataCollection', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Auto-save Progress</p>
                  <p className="text-sm text-muted-foreground">Automatically save your session data locally</p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Cloud Sync</p>
                  <p className="text-sm text-muted-foreground">Sync your data across devices (requires account)</p>
                </div>
                <Switch
                  checked={settings.cloudSync}
                  onCheckedChange={(checked) => updateSetting('cloudSync', checked)}
                />
              </div>
            </div>
          </Card>

          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Download className="h-5 w-5" />
              Data Management
            </h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Export My Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Key className="mr-2 h-4 w-4" />
                Manage API Keys
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Delete All Data
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Settings */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset to Defaults</Button>
        <Button variant="timer">Save Settings</Button>
      </div>
    </div>
  );
}