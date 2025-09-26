import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Coffee, SkipForward, Sparkles, X } from 'lucide-react';

interface Quote {
  id: string;
  text: string;
  author: string;
}

interface ExternalSmilePopupProps {
  sessionType?: 'focus' | 'break' | 'longBreak';
  sessionCount?: number;
  customImage?: string;
  showQuotes?: boolean;
  showCelebration?: boolean;
  autoClose?: boolean;
  closeDelay?: number;
}

// Get quotes from localStorage or use minimal defaults
const getStoredQuotes = (): Quote[] => {
  const stored = localStorage.getItem('stored_quotes');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [
    {
      id: '1',
      text: 'The secret of getting ahead is getting started.',
      author: 'Mark Twain'
    },
    {
      id: '2',
      text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
      author: 'Winston Churchill'
    },
    {
      id: '3',
      text: 'The way to get started is to quit talking and begin doing.',
      author: 'Walt Disney'
    }
  ];
};

const CelebrationEffects = ({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating sparkles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce opacity-70"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        >
          <Sparkles className="h-6 w-6 text-yellow-300" />
        </div>
      ))}
    </div>
  );
};

export function ExternalSmilePopup({
  sessionType = 'focus',
  sessionCount = 1,
  customImage,
  showQuotes = true,
  showCelebration = true,
  autoClose = false,
  closeDelay = 5
}: ExternalSmilePopupProps) {
  
  // Force autoClose to false for debugging - TEMPORARY FIX
  const safeAutoClose = false; // Force to false to prevent auto-closing
  const safeCloseDelay = typeof closeDelay === 'number' && closeDelay > 0 ? closeDelay : 5;
  
  console.log('ExternalSmilePopup - Safe values:', {
    originalAutoClose: autoClose,
    safeAutoClose,
    originalCloseDelay: closeDelay,
    safeCloseDelay
  });
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    const initialTime = safeAutoClose ? safeCloseDelay : 0;
    console.log('Initial timeLeft state:', { 
      safeAutoClose, 
      safeCloseDelay, 
      initialTime 
    });
    return initialTime;
  });
  const [initialDelay] = useState(safeCloseDelay);

  // Debug: Log the props to see what's being passed
  useEffect(() => {
    console.log('ExternalSmilePopup mounted with props:', {
      originalAutoClose: autoClose,
      safeAutoClose,
      originalCloseDelay: closeDelay,
      safeCloseDelay,
      timeLeft,
      sessionType,
      sessionCount
    });
    
    // Add window beforeunload listener to debug unexpected closes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log('Window is about to close/unload');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [safeAutoClose, safeCloseDelay, timeLeft, sessionType, sessionCount]);

  useEffect(() => {
    if (showQuotes) {
      setIsLoading(true);
      setTimeout(() => {
        const quotes = getStoredQuotes();
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setQuote(randomQuote);
        setIsLoading(false);
      }, 1000);
    }
  }, [showQuotes]);

  // Auto close timer
  useEffect(() => {
    console.log('Auto-close effect triggered:', { 
      safeAutoClose, 
      timeLeft,
      willClose: safeAutoClose && timeLeft === 0
    });
    
    if (!safeAutoClose) {
      console.log('Auto-close is disabled, popup will stay open indefinitely');
      return;
    }
    
    if (safeAutoClose && timeLeft > 0) {
      console.log(`Auto-close countdown: ${timeLeft} seconds remaining`);
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (safeAutoClose && timeLeft === 0) {
      console.log('Auto-close timer reached zero, closing window');
      window.close();
    }
  }, [safeAutoClose, timeLeft]);

  const handleAction = (type: 'continue' | 'skip') => {
    console.log('handleAction called with type:', type);
    // Send message back to extension
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'SMILE_POPUP_ACTION',
        action: type
      });
    }
    console.log('Closing window due to user action');
    window.close();
  };

  const handleClose = () => {
    console.log('handleClose called - user clicked close button');
    window.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4 relative">
      {/* Celebration Effects */}
      <CelebrationEffects isVisible={showCelebration} />

      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Auto close indicator with progress */}
      {safeAutoClose && timeLeft > 0 && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg px-4 py-3 text-white text-sm font-medium border border-white/20 min-w-[180px]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              Auto-closing in {timeLeft}s
            </div>
            {/* Progress bar */}
            <div className="w-full bg-white/20 rounded-full h-1">
              <div 
                className="bg-white rounded-full h-1 transition-all duration-1000 ease-linear"
                style={{ 
                  width: `${((initialDelay - timeLeft) / initialDelay) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <Card className="w-full max-w-md text-center shadow-2xl border-0 bg-white/95 backdrop-blur-sm animate-in zoom-in-95 duration-500 relative z-10">
        <CardHeader className="pb-6">
          {customImage && (
            <div className="mb-6">
              <img
                src={customImage}
                alt="Custom motivation"
                className="max-h-32 w-auto mx-auto rounded-xl shadow-lg"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-600 px-6 py-3 rounded-full text-lg font-bold shadow-lg animate-pulse border border-green-500/30">
                🎉 Session Complete!
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Great Work!
            </h1>
            <p className="text-gray-600 text-lg">
              Time to celebrate and recharge! 😊
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {showQuotes && (
            <>
              {isLoading ? (
                <div className="space-y-4 py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </div>
                </div>
              ) : quote ? (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <blockquote className="text-lg leading-relaxed font-medium italic text-gray-800">
                    "{quote.text}"
                  </blockquote>
                  <cite className="block text-right mt-4 not-italic text-gray-600 font-medium">
                    — {quote.author}
                  </cite>
                </div>
              ) : null}
            </>
          )}

          <div className="flex justify-center gap-4 pt-4">
            <Button
              onClick={() => handleAction('skip')}
              variant="outline"
              size="lg"
              className="gap-2 hover:scale-105 transition-all duration-200"
            >
              <SkipForward className="h-4 w-4" />
              Skip Break
            </Button>
            <Button
              onClick={() => handleAction('continue')}
              size="lg"
              className="gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <Coffee className="h-4 w-4" />
              Start Break
            </Button>
          </div>

          <div className="text-sm text-gray-500">
            Session {sessionCount} completed • Keep up the great work!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}