import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Lightbulb, 
  Target, 
  Clock, 
  MessageCircle, 
  History, 
  Plus, 
  Archive, 
  Trash2,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { generateGeminiResponse } from '@/lib/gemini';
import { useGeminiSettings } from '@/hooks/useGeminiSettings';
import { useAuth } from '@/hooks/useAuth';
import { 
  useActiveConversation, 
  useConversationMessages, 
  useAddChatMessage, 
  useChatConversations,
  useCreateConversation,
  useArchiveConversation,
  useChatStats
} from '@/hooks/useSupabaseQueries';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'suggestion' | 'tip' | 'encouragement';
}

export function AiAssistant() {
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { settings: geminiSettings } = useGeminiSettings();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Data fetching hooks
  const { data: activeConversation, isLoading: conversationLoading } = useActiveConversation();
  const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useConversationMessages(activeConversation?.id);
  const { data: conversations = [] } = useChatConversations();
  const { data: chatStats } = useChatStats();

  // Mutation hooks
  const addMessage = useAddChatMessage();
  const createConversation = useCreateConversation();
  const archiveConversation = useArchiveConversation();

  // Convert database messages to component format
  const formattedMessages: Message[] = messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    sender: msg.sender,
    timestamp: new Date(msg.created_at),
    type: msg.message_type as 'suggestion' | 'tip' | 'encouragement'
  }));

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [formattedMessages]);

  // Add welcome message if no messages exist
  useEffect(() => {
    if (activeConversation && messages.length === 0 && !messagesLoading) {
      const welcomeMessage = {
        conversation_id: activeConversation.id,
        user_id: user!.id,
        content: 'Hello! I\'m your AI productivity coach. I can help you with focus techniques, productivity tips, and motivation. How can I assist you today?',
        sender: 'ai' as const,
        message_type: 'encouragement' as const,
      };
      
      addMessage.mutate(welcomeMessage);
    }
  }, [activeConversation, messages.length, messagesLoading]);

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
    if (!inputMessage.trim() || !activeConversation || !user) return;

    if (!geminiSettings.isConfigured) {
      toast.error('Please set your Gemini API key and select a model in Settings first.');
      return;
    }

    const messageContent = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    const startTime = Date.now();

    try {
      // Add user message to database
      await addMessage.mutateAsync({
        conversation_id: activeConversation.id,
        user_id: user.id,
        content: messageContent,
        sender: 'user',
        message_type: 'text',
      });

      console.log('Debug - API Key:', geminiSettings.apiKey ? 'Present' : 'Missing');
      console.log('Debug - Model:', geminiSettings.model);
      console.log('Debug - Is Configured:', geminiSettings.isConfigured);
      
      // Generate AI response
      const aiResponseContent = await generateGeminiResponse(
        geminiSettings.apiKey!, 
        messageContent, 
        geminiSettings.model!
      );

      const responseTime = Date.now() - startTime;
      
      // Determine message type based on content
      const messageType = determineMessageType(aiResponseContent);

      // Add AI response to database
      await addMessage.mutateAsync({
        conversation_id: activeConversation.id,
        user_id: user.id,
        content: aiResponseContent,
        sender: 'ai',
        message_type: messageType,
        response_time_ms: responseTime,
        tokens_used: Math.ceil(aiResponseContent.length / 4), // Rough token estimate
      });

      toast.success('Response generated successfully!');
    } catch (error) {
      console.error('Error generating Gemini response:', error);
      
      // Add error message to database
      await addMessage.mutateAsync({
        conversation_id: activeConversation.id,
        user_id: user.id,
        content: 'Sorry, I could not generate a response. Please check your API key and model selection.',
        sender: 'ai',
        message_type: 'encouragement',
        response_time_ms: Date.now() - startTime,
      });

      toast.error('Failed to generate AI response. Please check your settings.');
    } finally {
      setIsTyping(false);
    }
  };

  const determineMessageType = (content: string): 'text' | 'suggestion' | 'tip' | 'encouragement' => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('try') || lowerContent.includes('consider') || lowerContent.includes('suggest')) {
      return 'suggestion';
    } else if (lowerContent.includes('tip') || lowerContent.includes('technique') || lowerContent.includes('method')) {
      return 'tip';
    } else if (lowerContent.includes('you can') || lowerContent.includes('believe') || lowerContent.includes('great')) {
      return 'encouragement';
    }
    
    return 'text';
  };

  const handleNewConversation = async () => {
    try {
      await createConversation.mutateAsync({ title: 'New Conversation' });
      toast.success('New conversation started!');
    } catch (error) {
      toast.error('Failed to create new conversation');
    }
  };

  const handleArchiveConversation = async () => {
    if (!activeConversation) return;
    
    try {
      await archiveConversation.mutateAsync(activeConversation.id);
      toast.success('Conversation archived');
    } catch (error) {
      toast.error('Failed to archive conversation');
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

  if (conversationLoading || messagesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          {/* Chat Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">
                {activeConversation?.title || 'AI Assistant'}
              </h3>
              {activeConversation && (
                <Badge variant="outline" className="text-xs">
                  {activeConversation.message_count} messages
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleNewConversation}>
                <Plus className="h-4 w-4 mr-1" />
                New Chat
              </Button>
              {activeConversation && activeConversation.message_count > 0 && (
                <Button variant="outline" size="sm" onClick={handleArchiveConversation}>
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => refetchMessages()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card className="glass">
            {/* Chat Messages */}
            <ScrollArea className="h-96 p-4">
              <div className="space-y-4">
                {formattedMessages.map((message) => (
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
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                
                <div ref={messagesEndRef} />
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

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Conversation History</h3>
            {chatStats && (
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{chatStats.totalConversations} conversations</span>
                <span>{chatStats.totalMessages} messages</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Card key={conversation.id} className="glass p-4 hover:bg-card/80 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {conversation.title || 'Untitled Conversation'}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {conversation.message_count} messages
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(conversation.last_message_at).toLocaleDateString()}
                      </span>
                      {conversation.is_active && (
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {conversations.length === 0 && (
              <Card className="glass p-8 text-center">
                <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Conversations Yet</h3>
                <p className="text-muted-foreground mb-4">Start chatting with your AI assistant to build your conversation history!</p>
                <Button onClick={handleNewConversation}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start First Conversation
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="glass p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Chat Statistics</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Conversations:</span>
                    <span className="font-medium">{chatStats?.totalConversations || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Messages:</span>
                    <span className="font-medium">{chatStats?.totalMessages || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Messages/Chat:</span>
                    <span className="font-medium">{chatStats?.averageMessagesPerConversation || 0}</span>
                  </div>
                </div>
                <Badge variant="secondary">Usage Analytics</Badge>
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  <h3 className="font-semibold text-foreground">AI Performance</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your AI assistant is responding quickly and providing helpful insights. Average response time is under 2 seconds.
                </p>
                <Badge variant="outline">Performance Metrics</Badge>
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-secondary" />
                  <h3 className="font-semibold text-foreground">Conversation Tips</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Try asking specific questions about your productivity challenges for more personalized advice. The AI learns from your conversation history.
                </p>
                <Badge variant="secondary">Usage Tips</Badge>
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold text-foreground">Privacy & Data</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your conversations are stored securely and privately. You can archive or delete conversations at any time from the History tab.
                </p>
                <Badge variant="outline">Privacy Info</Badge>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}