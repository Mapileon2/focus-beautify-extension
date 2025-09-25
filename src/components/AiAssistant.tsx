import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, Sparkles, Lightbulb, Target, Clock, MessageCircle } from 'lucide-react';
import { generateGeminiResponse } from '@/lib/gemini';
import { useGeminiSettings } from '@/hooks/useGeminiSettings';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'suggestion' | 'tip' | 'encouragement';
}

export function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI productivity coach. I can help you with focus techniques, productivity tips, and motivation. How can I assist you today?',
      sender: 'ai',
      timestamp: new Date(),
      type: 'encouragement'
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { settings: geminiSettings } = useGeminiSettings();

  // No need for useEffect to load settings - handled by useGeminiSettings hook

  const quickSuggestions = [
    'How can I improve my focus?',
    'What\'s the best break strategy?',
    'I\'m feeling unmotivated',
    'Tips for deep work sessions',
    'How to avoid distractions?',
    'Create a motivational quote'
  ];

  const aiResponses = {
    focus: [
      'Try the 2-minute rule: if a task takes less than 2 minutes, do it immediately. For longer tasks, use your Pomodoro sessions.',
      'Consider using ambient sounds or focus music. Many people find that consistent background noise helps maintain concentration.',
      'Keep a distraction log - write down when you get distracted and what caused it. This helps identify patterns.'
    ],
    break: [
      'Take active breaks! Try a short walk, some stretching, or deep breathing exercises to refresh your mind.',
      'The 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds to rest your eyes.',
      'Avoid social media during breaks - it can be mentally stimulating and make it harder to return to work.'
    ],
    motivation: [
      'Remember why you started. Connect your current task to your bigger goals and values.',
      'Break large tasks into smaller, manageable chunks. Celebrate small wins along the way!',
      'Your future self will thank you for the work you do today. Stay consistent, even when motivation is low.'
    ],
    general: [
      'Consistency beats intensity. Better to have shorter, regular focus sessions than sporadic long ones.',
      'Your environment shapes your behavior. Create a dedicated workspace that signals it\'s time to focus.',
      'Progress, not perfection. Every session completed is a step forward, regardless of how you feel about it.'
    ]
  };

  const getAiResponse = (message: string): Message => {
    const lowerMessage = message.toLowerCase();
    let response = '';
    let type: 'suggestion' | 'tip' | 'encouragement' = 'suggestion';

    if (lowerMessage.includes('focus') || lowerMessage.includes('concentrate')) {
      response = aiResponses.focus[Math.floor(Math.random() * aiResponses.focus.length)];
      type = 'tip';
    } else if (lowerMessage.includes('break') || lowerMessage.includes('rest')) {
      response = aiResponses.break[Math.floor(Math.random() * aiResponses.break.length)];
      type = 'suggestion';
    } else if (lowerMessage.includes('motivat') || lowerMessage.includes('unmotivat')) {
      response = aiResponses.motivation[Math.floor(Math.random() * aiResponses.motivation.length)];
      type = 'encouragement';
    } else if (lowerMessage.includes('quote')) {
      const quotes = [
        'Success is not final, failure is not fatal: it is the courage to continue that counts.',
        'The way to get started is to quit talking and begin doing.',
        'Don\'t watch the clock; do what it does. Keep going.'
      ];
      response = `Here's a motivational quote for you: "${quotes[Math.floor(Math.random() * quotes.length)]}"`;
      type = 'encouragement';
    } else {
      response = aiResponses.general[Math.floor(Math.random() * aiResponses.general.length)];
      type = 'tip';
    }

    return {
      id: Date.now().toString(),
      content: response,
      sender: 'ai',
      timestamp: new Date(),
      type
    };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    if (!geminiSettings.isConfigured) {
      toast({
        title: "AI Not Configured",
        description: "Please set your Gemini API key and select a model in the AI settings.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      console.log('Debug - API Key:', geminiSettings.apiKey ? 'Present' : 'Missing');
      console.log('Debug - Model:', geminiSettings.model);
      console.log('Debug - Is Configured:', geminiSettings.isConfigured);
      
      const aiResponseContent = await generateGeminiResponse(geminiSettings.apiKey!, inputMessage, geminiSettings.model!);
      const aiResponse: Message = {
        id: Date.now().toString(),
        content: aiResponseContent,
        sender: 'ai',
        timestamp: new Date(),
        type: 'tip' // Default type, can be improved with AI response analysis
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error generating Gemini response:', error);
      console.error('Full error details:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          content: 'Sorry, I could not generate a response. Please check your API key and model selection.',
          sender: 'ai',
          timestamp: new Date(),
          type: 'encouragement'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendQuickMessage = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'suggestion': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'tip': return <Target className="h-4 w-4 text-blue-500" />;
      case 'encouragement': return <Sparkles className="h-4 w-4 text-green-500" />;
      default: return <Bot className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="glass">
            {/* Chat Messages */}
            <ScrollArea className="h-96 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                        {getMessageIcon(message.type)}
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-card text-card-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {message.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent to-accent-glow flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-card text-card-foreground rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Suggestions */}
            <div className="border-t border-border p-4 space-y-3">
              <p className="text-sm text-muted-foreground">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => sendQuickMessage(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything about productivity..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="glass"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  variant="timer"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="glass p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Focus Patterns</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your peak focus time is between 9 AM and 11 AM. Consider scheduling your most important tasks during this window.
                </p>
                <Badge variant="secondary">Personalized Insight</Badge>
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Break Optimization</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your productivity increases by 23% when you take active breaks. Try a 5-minute walk between sessions.
                </p>
                <Badge variant="outline">AI Recommendation</Badge>
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-secondary" />
                  <h3 className="font-semibold text-foreground">Motivation Boost</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  "The secret of getting ahead is getting started." - Mark Twain. You've got this! 🌟
                </p>
                <Badge variant="secondary">Daily Inspiration</Badge>
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold text-foreground">Smart Tip</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Try the "two-minute rule": if something takes less than two minutes, do it now instead of adding it to your todo list.
                </p>
                <Badge variant="outline">Productivity Hack</Badge>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}