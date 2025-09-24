import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Upload, Image, Palette, Bell, Timer, Smile, Sparkles, Shield, Download, Key } from 'lucide-react';
import { GeminiAISettings } from './GeminiAISettings';

interface SmilePopupSettings {
  enabled: boolean;
  showQuotes: boolean;
  showCelebration: boolean;
  customImage: string;
  animationIntensity: 'low' | 'medium' | 'high';
  quotesSource: 'motivational' | 'productivity' | 'custom';
  autoClose: boolean;
  closeDelay: number;
}

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  smilePopup: SmilePopupSettings;
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
  };
}

export function Settings() {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'system',
    notifications: true,
    soundEnabled: true,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    smilePopup: {
      enabled: true,
      showQuotes: true,
      showCelebration: true,
      customImage: '',
      animationIntensity: 'medium',
      quotesSource: 'motivational',
      autoClose: false,
      closeDelay: 5
    },
    privacy: {
      dataCollection: true,
      analytics: true,
    },
  });

  const updateSmilePopupSetting = <K extends keyof SmilePopupSettings>(
    key: K, 
    value: SmilePopupSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      smilePopup: {
        ...prev.smilePopup,
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="timer" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="smile">Smile Popup</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Timer Settings */}
        <TabsContent value="timer" className="space-y-6">
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Timer className="h-5 w-5" />
              Timer Configuration
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-start Breaks</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically start breaks after focus sessions
                  </p>
                </div>
                <Switch
                  checked={settings.autoStartBreaks}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoStartBreaks: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-start Pomodoros</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically start focus sessions after breaks
                  </p>
                </div>
                <Switch
                  checked={settings.autoStartPomodoros}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoStartPomodoros: checked }))}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai" className="space-y-6">
          <GeminiAISettings />
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
                  <Label>Desktop Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show browser notifications for session changes
                  </p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sound Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound when sessions start or end
                  </p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, soundEnabled: checked }))}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Smile Popup Settings */}
        <TabsContent value="smile" className="space-y-6">
          <Card className="glass p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Smile className="h-5 w-5 text-primary" />
              Smile Popup Configuration
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Smile Popup</Label>
                  <p className="text-sm text-muted-foreground">
                    Show celebration popup when sessions complete
                  </p>
                </div>
                <Switch
                  checked={settings.smilePopup.enabled}
                  onCheckedChange={(checked) => updateSmilePopupSetting('enabled', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Motivational Quotes</Label>
                  <p className="text-sm text-muted-foreground">
                    Display inspirational quotes in popup
                  </p>
                </div>
                <Switch
                  checked={settings.smilePopup.showQuotes}
                  onCheckedChange={(checked) => updateSmilePopupSetting('showQuotes', checked)}
                  disabled={!settings.smilePopup.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Celebration Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable floating sparkles and animations
                  </p>
                </div>
                <Switch
                  checked={settings.smilePopup.showCelebration}
                  onCheckedChange={(checked) => updateSmilePopupSetting('showCelebration', checked)}
                  disabled={!settings.smilePopup.enabled}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Custom Motivation Image</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter image URL or upload"
                    value={settings.smilePopup.customImage}
                    onChange={(e) => updateSmilePopupSetting('customImage', e.target.value)}
                    disabled={!settings.smilePopup.enabled}
                  />
                  <Button variant="outline" size="icon" disabled={!settings.smilePopup.enabled}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {settings.smilePopup.customImage && (
                  <div className="mt-2">
                    <img 
                      src={settings.smilePopup.customImage} 
                      alt="Preview" 
                      className="h-20 w-20 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Animation Intensity</Label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((intensity) => (
                    <Button
                      key={intensity}
                      variant={settings.smilePopup.animationIntensity === intensity ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSmilePopupSetting('animationIntensity', intensity)}
                      disabled={!settings.smilePopup.enabled}
                      className="capitalize"
                    >
                      <Sparkles className="mr-1 h-3 w-3" />
                      {intensity}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Quotes Source</Label>
                <div className="flex gap-2">
                  {(['motivational', 'productivity', 'custom'] as const).map((source) => (
                    <Button
                      key={source}
                      variant={settings.smilePopup.quotesSource === source ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSmilePopupSetting('quotesSource', source)}
                      disabled={!settings.smilePopup.enabled || !settings.smilePopup.showQuotes}
                      className="capitalize"
                    >
                      {source}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Close Popup</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically close popup after set time
                  </p>
                </div>
                <Switch
                  checked={settings.smilePopup.autoClose}
                  onCheckedChange={(checked) => updateSmilePopupSetting('autoClose', checked)}
                  disabled={!settings.smilePopup.enabled}
                />
              </div>

              {settings.smilePopup.autoClose && (
                <div className="space-y-2">
                  <Label>Auto Close Delay (seconds)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.smilePopup.closeDelay}
                    onChange={(e) => updateSmilePopupSetting('closeDelay', parseInt(e.target.value) || 5)}
                    disabled={!settings.smilePopup.enabled}
                  />
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5" />
              Privacy & Data
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Data Collection</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow anonymous usage analytics to improve the app
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.dataCollection}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, dataCollection: checked }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Send performance and usage statistics
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.analytics}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, analytics: checked }
                  }))}
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