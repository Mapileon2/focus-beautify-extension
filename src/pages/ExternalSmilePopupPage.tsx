import React, { useEffect, useState } from 'react';
import { ExternalSmilePopup } from '@/components/ExternalSmilePopup';
import { useSmilePopupSettings } from '@/hooks/useChromeStorage';

export function ExternalSmilePopupPage() {
  const { value: smilePopupSettings, isLoading } = useSmilePopupSettings();
  const [popupData, setPopupData] = useState({
    sessionType: 'focus' as 'focus' | 'break' | 'longBreak',
    sessionCount: 1,
  });

  // Debug: Log the settings being loaded
  useEffect(() => {
    console.log('ExternalSmilePopupPage - Settings loaded:', {
      settings: smilePopupSettings,
      isLoading,
      autoClose: smilePopupSettings?.autoClose,
      closeDelay: smilePopupSettings?.closeDelay
    });
  }, [smilePopupSettings, isLoading]);

  useEffect(() => {
    // Get popup data from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const sessionType = urlParams.get('sessionType') as 'focus' | 'break' | 'longBreak' || 'focus';
    const sessionCount = parseInt(urlParams.get('sessionCount') || '1');

    setPopupData({
      sessionType,
      sessionCount,
    });

    // Set window title based on session type
    document.title = `Focus Timer - ${sessionType === 'focus' ? 'Focus' : 'Break'} Complete!`;
    
    // Add auto-close info to title if enabled
    if (smilePopupSettings.autoClose) {
      document.title += ` (Auto-closing in ${smilePopupSettings.closeDelay}s)`;
    }
  }, [smilePopupSettings.autoClose, smilePopupSettings.closeDelay]);

  // Show loading state until settings are loaded
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-white text-lg">Loading celebration...</div>
      </div>
    );
  }

  return (
    <ExternalSmilePopup
      sessionType={popupData.sessionType}
      sessionCount={popupData.sessionCount}
      customImage={smilePopupSettings.customImage || ''}
      showQuotes={smilePopupSettings.showQuotes ?? true}
      showCelebration={smilePopupSettings.showCelebration ?? true}
      autoClose={smilePopupSettings.autoClose ?? false}
      closeDelay={smilePopupSettings.closeDelay ?? 5}
    />
  );
}