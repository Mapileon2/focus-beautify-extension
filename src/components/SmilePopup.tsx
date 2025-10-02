import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Smile, Coffee, SkipForward, Sparkles } from 'lucide-react';

interface Quote {
  id: string;
  text: string;
  author: string;
}

interface SmilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSkipBreak: () => void;
  onStartBreak: () => void;
  sessionType: 'focus' | 'break' | 'longBreak';
  sessionCount: number;
  customImage?: string;
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
    },
    {
      id: '4',
      text: 'Don\'t be afraid to give up the good to go for the great.',
      author: 'John D. Rockefeller'
    },
    {
      id: '5',
      text: 'It is during our darkest moments that we must focus to see the light.',
      author: 'Aristotle'
    }
  ];
};

const CelebrationEffects = ({ isVisible, sessionType }: { isVisible: boolean; sessionType: string }) => {
  if (!isVisible) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating sparkles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float opacity-70"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        >
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      ))}
    </div>
  );
};

const SmilePopup: React.FC<SmilePopupProps> = ({
  isOpen,
  onClose,
  onSkipBreak,
  onStartBreak,
  sessionType,
  sessionCount,
  customImage
}) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Get quotes from storage
      setTimeout(() => {
        const quotes = getStoredQuotes();
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setQuote(randomQuote);
        setIsLoading(false);
      }, 1000);
    }
  }, [isOpen]);

  const handleAction = (type: 'smile' | 'skip') => {
    // Record usage analytics here if needed
    if (type === 'smile') {
      onStartBreak();
    } else {
      onSkipBreak();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 border-0 bg-transparent shadow-none">
        <div className="relative">
          {/* Celebration Effects */}
          <CelebrationEffects isVisible={isOpen} sessionType={sessionType} />

          <Card className="text-center shadow-2xl border-0 bg-background/95 backdrop-blur-sm animate-in zoom-in-95 duration-300 relative z-10">
            <CardHeader className="pb-6">
              {customImage && (
                <div className="mb-6">
                  <img
                    src={customImage}
                    alt="Custom motivation"
                    className="max-h-40 w-auto mx-auto rounded-xl shadow-lg"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="bg-gradient-to-r from-success/20 to-primary/20 text-success px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse border border-success/30">
                    🎉 Session Complete!
                  </div>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                  Time's Up!
                </h3>
                <p className="text-muted-foreground">
                  Time to Smile and recharge!
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-4 py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-3/4 mx-auto" />
                    <Skeleton className="h-3 w-1/2 mx-auto" />
                  </div>
                </div>
              ) : quote ? (
                <div className="bg-muted/50 p-6 rounded-xl border border-border/50">
                  <blockquote className="text-lg leading-relaxed font-medium italic">
                    "{quote.text}"
                  </blockquote>
                  <cite className="block text-right mt-4 not-italic text-muted-foreground font-medium">
                    — {quote.author}
                  </cite>
                </div>
              ) : null}

              <div className="flex justify-center gap-3 pt-4">
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
                  onClick={() => handleAction('smile')}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-success to-primary hover:from-success/90 hover:to-primary/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  <Coffee className="h-4 w-4" />
                  Start Break
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmilePopup;