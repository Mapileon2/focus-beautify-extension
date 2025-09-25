import { useState, useEffect } from 'react';

export interface GeminiSettings {
  apiKey: string | null;
  model: string | null;
  isConfigured: boolean;
}

// Centralized hook for Gemini API settings
export function useGeminiSettings() {
  const [settings, setSettings] = useState<GeminiSettings>({
    apiKey: null,
    model: null,
    isConfigured: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage
  const loadSettings = () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    const model = localStorage.getItem('gemini_model');
    
    console.log('Debug - useGeminiSettings loadSettings:', {
      apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'null',
      model,
      isConfigured: !!(apiKey && model)
    });
    
    const newSettings = {
      apiKey,
      model,
      isConfigured: !!(apiKey && model),
    };
    
    setSettings(newSettings);
    setIsLoading(false);
    return newSettings;
  };

  // Save settings to localStorage
  const saveSettings = (apiKey: string, model: string) => {
    localStorage.setItem('gemini_api_key', apiKey);
    localStorage.setItem('gemini_model', model);
    
    const newSettings = {
      apiKey,
      model,
      isConfigured: true,
    };
    
    setSettings(newSettings);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('gemini-settings-changed', {
      detail: newSettings
    }));
  };

  // Clear settings
  const clearSettings = () => {
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('gemini_model');
    
    const newSettings = {
      apiKey: null,
      model: null,
      isConfigured: false,
    };
    
    setSettings(newSettings);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('gemini-settings-changed', {
      detail: newSettings
    }));
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gemini_api_key' || e.key === 'gemini_model') {
        loadSettings();
      }
    };

    const handleCustomEvent = (e: CustomEvent) => {
      setSettings(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('gemini-settings-changed', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('gemini-settings-changed', handleCustomEvent as EventListener);
    };
  }, []);

  return {
    settings,
    isLoading,
    saveSettings,
    clearSettings,
    reload: loadSettings,
  };
}

// Helper function to get current settings synchronously
export function getGeminiSettings(): GeminiSettings {
  const apiKey = localStorage.getItem('gemini_api_key');
  const model = localStorage.getItem('gemini_model');
  
  return {
    apiKey,
    model,
    isConfigured: !!(apiKey && model),
  };
}

// Helper function to check if Gemini is configured
export function isGeminiConfigured(): boolean {
  const apiKey = localStorage.getItem('gemini_api_key');
  const model = localStorage.getItem('gemini_model');
  return !!(apiKey && model);
}