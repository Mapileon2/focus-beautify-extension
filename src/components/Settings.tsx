import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Upload, Image, Palette, Bell, Timer, Smile, Sparkles, Shield, Download, Key, Save, AlertTriangle, LogOut, User } from 'lucide-react';
import { GeminiAISettings } from './GeminiAISettings';
import { ImageUpload } from './ImageUpload';

import { useSmilePopupSettings, useAppSettings } from '@/hooks/useChromeStorage';
import { useToast } from '@/hooks/use-toast';
import { clearChromeStorage, checkStorageHealth } from '@/utils/storageCleanup';
import { useAuth } from '@/hooks/useAuth';

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
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  
  // Use Chrome storage hooks
  const {
    value: smilePopupSettings,
    setValue: setSmilePopupSettings,
    isLoading: smilePopupLoading,
    error: smilePopupError
  } = useSmilePopupSettings();

  const {
    value: appSettings,
    setValue: setAppSettings,
    isLoading: appSettingsLoading,
    error: appSettingsError
  } = useAppSettings();



  const updateSmilePopupSetting = <K extends keyof typeof smilePopupSettings>(
    key: K, 
    value: typeof smilePopupSettings[K]
  ) => {
    const newSettings = {
      ...smilePopupSettings,
      [key]: value
    };
    setSmilePopupSettings(newSettings);
    // Settings auto-save with Chrome storage hooks
    toast({
      title: "Setting Updated",
      description: "Your preference has been saved automatically.",
    });
  };

  const updateAppSetting = <K extends keyof typeof appSettings>(
    key: K,
    value: typeof appSettings[K]
  ) => {
    const newSettings = {
      ...appSettings,
      [key]: value
    };
    setAppSettings(newSettings);
    // Settings auto-save with Chrome storage hooks
    toast({
      title: "Setting Updated", 
      description: "Your preference has been saved automatically.",
    });
  };

  const resetToDefaults = async () => {
    try {
      await setSmilePopupSettings({
        enabled: true,
        showQuotes: true,
        showCelebration: true,
        customImage: '',
        animationIntensity: 'medium',
        quotesSource: 'motivational',
        autoClose: false,
        closeDelay: 5,
        showAsExternalWindow: false,
        windowWidth: 400,
        windowHeight: 300,
      });

      await setAppSettings({
        theme: 'system',
        notifications: true,
        soundEnabled: true,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        privacy: {
          dataCollection: true,
          analytics: true,
        },
      });

      toast({
        title: "Settings reset",
        description: "All settings have been reset to defaults",
      });
    } catch (error) {
      toast({
        title: "Reset failed",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (smilePopupLoading || appSettingsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show error state
  if (smilePopupError || appSettingsError) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Failed to load settings: {smilePopupError || appSettingsError}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Reload
        </Button>
      </div>
    );
  }

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
              Timer Behavior
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
                  checked={appSettings.autoStartBreaks}
                  onCheckedChange={(checked) => updateAppSetting('autoStartBreaks', checked)}
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
                  checked={appSettings.autoStartPomodoros}
                  onCheckedChange={(checked) => updateAppSetting('autoStartPomodoros', checked)}
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
                  checked={appSettings.notifications}
                  onCheckedChange={(checked) => updateAppSetting('notifications', checked)}
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
                  checked={appSettings.soundEnabled}
                  onCheckedChange={(checked) => updateAppSetting('soundEnabled', checked)}
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
                  checked={smilePopupSettings.enabled}
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
                  checked={smilePopupSettings.showQuotes}
                  onCheckedChange={(checked) => updateSmilePopupSetting('showQuotes', checked)}
                  disabled={!smilePopupSettings.enabled}
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
                  checked={smilePopupSettings.showCelebration}
                  onCheckedChange={(checked) => updateSmilePopupSetting('showCelebration', checked)}
                  disabled={!smilePopupSettings.enabled}
                />
              </div>

              <Separator />

              <ImageUpload
                currentImage={smilePopupSettings.customImage}
                onImageChange={(imageData) => updateSmilePopupSetting('customImage', imageData)}
                disabled={!smilePopupSettings.enabled}
                maxSizeKB={100}
              />

              <div className="space-y-3">
                <Label>Animation Intensity</Label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((intensity) => (
                    <Button
                      key={intensity}
                      variant={smilePopupSettings.animationIntensity === intensity ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSmilePopupSetting('animationIntensity', intensity)}
                      disabled={!smilePopupSettings.enabled}
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
                      variant={smilePopupSettings.quotesSource === source ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSmilePopupSetting('quotesSource', source)}
                      disabled={!smilePopupSettings.enabled || !smilePopupSettings.showQuotes}
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
                  <Label>Show as External Window</Label>
                  <p className="text-sm text-muted-foreground">
                    Open celebration popup as a separate mini window outside Chrome
                  </p>
                </div>
                <Switch
                  checked={smilePopupSettings.showAsExternalWindow}
                  onCheckedChange={(checked) => updateSmilePopupSetting('showAsExternalWindow', checked)}
                  disabled={!smilePopupSettings.enabled}
                />
              </div>

              {/* Test button for external popup */}
              {smilePopupSettings.showAsExternalWindow && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const width = smilePopupSettings.windowWidth || 400;
                      const height = smilePopupSettings.windowHeight || 300;
                      const left = Math.round((screen.width - width) / 2);
                      const top = Math.round((screen.height - height) / 2);
                      
                      if (typeof chrome !== 'undefined' && chrome.windows) {
                        const url = chrome.runtime.getURL('smile-popup.html?sessionType=focus&sessionCount=1');
                        chrome.windows.create({
                          url,
                          type: 'popup',
                          width,
                          height,
                          left,
                          top,
                          focused: true,
                        }, (window) => {
                          if (chrome.runtime.lastError) {
                            toast({
                              title: "Test Failed",
                              description: chrome.runtime.lastError.message,
                              variant: "destructive",
                            });
                          } else {
                            toast({
                              title: "Test Successful",
                              description: "External popup window opened!",
                            });
                          }
                        });
                      } else {
                        toast({
                          title: "Chrome API Not Available",
                          description: "Windows API not accessible in this environment",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Test External Popup
                  </Button>
                </div>
              )}

              {smilePopupSettings.showAsExternalWindow && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Window Width (px)</Label>
                    <Input
                      type="number"
                      min="300"
                      max="800"
                      value={smilePopupSettings.windowWidth || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow any input during typing - no validation/clamping
                        if (value === '') {
                          updateSmilePopupSetting('windowWidth', '');
                        } else {
                          // Store the raw input value to allow natural typing
                          updateSmilePopupSetting('windowWidth', value);
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (!value) {
                          updateSmilePopupSetting('windowWidth', 400);
                        } else {
                          const numValue = parseInt(value);
                          if (isNaN(numValue) || numValue < 300) {
                            updateSmilePopupSetting('windowWidth', 400);
                          } else if (numValue > 800) {
                            updateSmilePopupSetting('windowWidth', 800);
                          } else {
                            updateSmilePopupSetting('windowWidth', numValue);
                          }
                        }
                      }}
                      placeholder="400"
                      disabled={!smilePopupSettings.enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Window Height (px)</Label>
                    <Input
                      type="number"
                      min="200"
                      max="600"
                      value={smilePopupSettings.windowHeight || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow any input during typing - no validation/clamping
                        if (value === '') {
                          updateSmilePopupSetting('windowHeight', '');
                        } else {
                          // Store the raw input value to allow natural typing
                          updateSmilePopupSetting('windowHeight', value);
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (!value) {
                          updateSmilePopupSetting('windowHeight', 300);
                        } else {
                          const numValue = parseInt(value);
                          if (isNaN(numValue) || numValue < 200) {
                            updateSmilePopupSetting('windowHeight', 300);
                          } else if (numValue > 600) {
                            updateSmilePopupSetting('windowHeight', 600);
                          } else {
                            updateSmilePopupSetting('windowHeight', numValue);
                          }
                        }
                      }}
                      placeholder="300"
                      disabled={!smilePopupSettings.enabled}
                    />
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Close Popup</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically close popup after set time (works for both inline and external windows)
                  </p>
                </div>
                <Switch
                  checked={smilePopupSettings.autoClose}
                  onCheckedChange={(checked) => updateSmilePopupSetting('autoClose', checked)}
                  disabled={!smilePopupSettings.enabled}
                />
              </div>

              {smilePopupSettings.autoClose && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Auto Close Delay (seconds)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={smilePopupSettings.closeDelay || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow any input during typing - no validation/clamping
                        if (value === '') {
                          updateSmilePopupSetting('closeDelay', '');
                        } else {
                          // Store the raw input value to allow natural typing
                          updateSmilePopupSetting('closeDelay', value);
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (!value) {
                          updateSmilePopupSetting('closeDelay', 5);
                        } else {
                          const numValue = parseInt(value);
                          if (isNaN(numValue) || numValue < 1) {
                            updateSmilePopupSetting('closeDelay', 5);
                          } else if (numValue > 30) {
                            updateSmilePopupSetting('closeDelay', 30);
                          } else {
                            updateSmilePopupSetting('closeDelay', numValue);
                          }
                        }
                      }}
                      placeholder="5"
                      disabled={!smilePopupSettings.enabled}
                    />
                  </div>
                  
                  {/* Test auto-close functionality */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const width = smilePopupSettings.windowWidth || 400;
                        const height = smilePopupSettings.windowHeight || 300;
                        const left = Math.round((screen.width - width) / 2);
                        const top = Math.round((screen.height - height) / 2);
                        
                        if (typeof chrome !== 'undefined' && chrome.windows) {
                          const url = chrome.runtime.getURL(`smile-popup.html?sessionType=focus&sessionCount=1&autoClose=true&closeDelay=${smilePopupSettings.closeDelay}`);
                          chrome.windows.create({
                            url,
                            type: 'popup',
                            width,
                            height,
                            left,
                            top,
                            focused: true,
                          }, (window) => {
                            if (chrome.runtime.lastError) {
                              toast({
                                title: "Test Failed",
                                description: chrome.runtime.lastError.message,
                                variant: "destructive",
                              });
                            } else {
                              toast({
                                title: "Auto-Close Test Started",
                                description: `External popup will close in ${smilePopupSettings.closeDelay} seconds`,
                              });
                            }
                          });
                        } else {
                          toast({
                            title: "Chrome API Not Available",
                            description: "Windows API not accessible in this environment",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={!smilePopupSettings.showAsExternalWindow}
                    >
                      Test Auto-Close (External)
                    </Button>
                    
                    <div className="text-xs text-muted-foreground self-center">
                      {smilePopupSettings.showAsExternalWindow 
                        ? `Will close in ${smilePopupSettings.closeDelay}s` 
                        : 'Enable external window to test'
                      }
                    </div>
                  </div>
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
                  checked={appSettings.privacy.dataCollection}
                  onCheckedChange={(checked) => updateAppSetting('privacy', {
                    ...appSettings.privacy,
                    dataCollection: checked
                  })}
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
                  checked={appSettings.privacy.analytics}
                  onCheckedChange={(checked) => updateAppSetting('privacy', {
                    ...appSettings.privacy,
                    analytics: checked
                  })}
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
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={async () => {
                  try {
                    await clearChromeStorage();
                    toast({
                      title: "Storage Cleared",
                      description: "All extension data has been cleared. Please reconfigure your settings.",
                    });
                    window.location.reload();
                  } catch (error) {
                    toast({
                      title: "Clear Failed",
                      description: "Failed to clear storage. Try reloading the extension.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Clear Storage (Fix Quota Issues)
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Delete All Data
              </Button>
            </div>
          </Card>

          {/* Account Management */}
          {user && (
            <Card className="glass p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                <User className="h-5 w-5" />
                Account
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                  <div>
                    <p className="font-medium text-foreground">Signed in as</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={async () => {
                    try {
                      await signOut();
                      toast({
                        title: "Signed Out",
                        description: "You have been successfully signed out.",
                      });
                    } catch (error) {
                      toast({
                        title: "Sign Out Failed",
                        description: "There was an error signing out. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Settings Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={resetToDefaults}>
          Reset to Defaults
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Save className="h-4 w-4" />
          Settings auto-save as you change them
        </div>
      </div>
    </div>
  );
}