import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Heart, Sparkles, Download, Share, Trash2, Search, Filter, Edit3, Plus, Bot, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  isFavorite: boolean;
  isAiGenerated: boolean;
  createdAt: Date;
}

export function EnhancedQuotesDashboard() {
  const [quotes, setQuotes] = useState<Quote[]>([
    {
      id: '1',
      text: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
      category: 'Motivation',
      isFavorite: true,
      isAiGenerated: false,
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2', 
      text: 'Focus is not just about what you concentrate on, but what you choose to ignore.',
      author: 'AI Assistant',
      category: 'Focus',
      isFavorite: false,
      isAiGenerated: true,
      createdAt: new Date('2024-02-01')
    },
    {
      id: '3',
      text: 'Success is the sum of small efforts repeated day in and day out.',
      author: 'Robert Collier',
      category: 'Success',
      isFavorite: true,
      isAiGenerated: false,
      createdAt: new Date('2024-01-20')
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteAuthor, setNewQuoteAuthor] = useState('');
  const [newQuoteCategory, setNewQuoteCategory] = useState('');
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { toast } = useToast();

  const categories = ['all', 'favorites', ...Array.from(new Set(quotes.map(q => q.category)))];

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || 
                           (filterCategory === 'favorites' && quote.isFavorite) ||
                           quote.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: string) => {
    setQuotes(prev => prev.map(quote => 
      quote.id === id ? { ...quote, isFavorite: !quote.isFavorite } : quote
    ));
  };

  const deleteQuote = (id: string) => {
    setQuotes(prev => prev.filter(quote => quote.id !== id));
    toast({
      title: "Quote Deleted",
      description: "The quote has been removed from your collection.",
    });
  };

  const addQuote = () => {
    if (!newQuoteText.trim() || !newQuoteAuthor.trim()) return;
    
    const newQuote: Quote = {
      id: Date.now().toString(),
      text: newQuoteText.trim(),
      author: newQuoteAuthor.trim(),
      category: newQuoteCategory || 'General',
      isFavorite: false,
      isAiGenerated: false,
      createdAt: new Date()
    };
    
    setQuotes(prev => [newQuote, ...prev]);
    setNewQuoteText('');
    setNewQuoteAuthor('');
    setNewQuoteCategory('');
    
    toast({
      title: "Quote Added",
      description: "Your new quote has been added to the collection.",
    });
  };

  const updateQuote = () => {
    if (!editingQuote) return;
    
    setQuotes(prev => prev.map(quote => 
      quote.id === editingQuote.id ? editingQuote : quote
    ));
    setEditingQuote(null);
    
    toast({
      title: "Quote Updated",
      description: "Your changes have been saved.",
    });
  };

  const generateCustomQuote = async () => {
    if (!customPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt for quote generation.",
        variant: "destructive"
      });
      return;
    }

    const apiKey = localStorage.getItem('gemini_api_key');
    const model = localStorage.getItem('gemini_model') || 'gemini-1.5-flash';

    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Please configure your Gemini API key in Settings first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate an inspirational quote based on this prompt: "${customPrompt}". Return only the quote text without quotes, followed by a line break, then "— [Author Name]" where Author Name should be an appropriate fictional or real author that fits the quote's style and theme.`
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 150,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quote');
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Parse the response to extract quote and author
      const lines = generatedText.trim().split('\n');
      const quoteText = lines[0].replace(/^["']|["']$/g, ''); // Remove quotes if present
      const authorLine = lines.find(line => line.includes('—')) || '— AI Assistant';
      const author = authorLine.replace('—', '').trim();

      const aiQuote: Quote = {
        id: Date.now().toString(),
        text: quoteText,
        author: author,
        category: 'AI Generated',
        isFavorite: false,
        isAiGenerated: true,
        createdAt: new Date()
      };
      
      setQuotes(prev => [aiQuote, ...prev]);
      setCustomPrompt('');
      
      toast({
        title: "Quote Generated! ✨",
        description: "Your AI-generated quote has been added to your collection.",
      });

    } catch (error) {
      console.error('Error generating quote:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate quote. Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateQuickQuote = async () => {
    const quickPrompts = [
      'productivity and focus',
      'overcoming challenges',
      'personal growth',
      'achieving goals',
      'staying motivated'
    ];
    
    const randomPrompt = quickPrompts[Math.floor(Math.random() * quickPrompts.length)];
    setCustomPrompt(randomPrompt);
    
    // Auto-generate after setting prompt
    setTimeout(() => generateCustomQuote(), 100);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass">
          <TabsTrigger value="browse">Browse Quotes</TabsTrigger>
          <TabsTrigger value="create">Create Quote</TabsTrigger>
          <TabsTrigger value="ai">🤖 AI Generator</TabsTrigger>
        </TabsList>

        {/* Browse Quotes Tab */}
        <TabsContent value="browse" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48 glass">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : 
                     category === 'favorites' ? 'Favorites' : 
                     category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quotes Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuotes.map(quote => (
              <Card key={quote.id} className="glass p-6 transition-all hover:scale-105 hover:glow-primary">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <Badge variant={quote.isAiGenerated ? "secondary" : "outline"} className="text-xs">
                      {quote.isAiGenerated ? (
                        <><Bot className="mr-1 h-3 w-3" /> AI</>
                      ) : (
                        quote.category
                      )}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(quote.id)}
                        className={quote.isFavorite ? 'text-red-500' : 'text-muted-foreground'}
                      >
                        <Heart className={`h-4 w-4 ${quote.isFavorite ? 'fill-current' : ''}`} />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingQuote(quote)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Quote</DialogTitle>
                          </DialogHeader>
                          {editingQuote && (
                            <div className="space-y-4">
                              <Textarea
                                value={editingQuote.text}
                                onChange={(e) => setEditingQuote(prev => 
                                  prev ? { ...prev, text: e.target.value } : null
                                )}
                                className="min-h-24"
                              />
                              <Input
                                value={editingQuote.author}
                                onChange={(e) => setEditingQuote(prev => 
                                  prev ? { ...prev, author: e.target.value } : null
                                )}
                                placeholder="Author"
                              />
                              <Input
                                value={editingQuote.category}
                                onChange={(e) => setEditingQuote(prev => 
                                  prev ? { ...prev, category: e.target.value } : null
                                )}
                                placeholder="Category"
                              />
                              <Button onClick={updateQuote} className="w-full">
                                Save Changes
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Quote</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this quote? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteQuote(quote.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <blockquote className="text-sm italic text-foreground leading-relaxed">
                    "{quote.text}"
                  </blockquote>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>— {quote.author}</span>
                    <span>{quote.createdAt.toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      <Share className="mr-1 h-3 w-3" />
                      Share
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      <Download className="mr-1 h-3 w-3" />
                      Save
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredQuotes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-muted-foreground">No quotes found matching your search.</p>
            </div>
          )}
        </TabsContent>

        {/* Create Quote Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Quote
            </h3>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter the quote text..."
                value={newQuoteText}
                onChange={(e) => setNewQuoteText(e.target.value)}
                className="glass min-h-24"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Author name"
                  value={newQuoteAuthor}
                  onChange={(e) => setNewQuoteAuthor(e.target.value)}
                  className="glass"
                />
                <Input
                  placeholder="Category (optional)"
                  value={newQuoteCategory}
                  onChange={(e) => setNewQuoteCategory(e.target.value)}
                  className="glass"
                />
              </div>
              <Button 
                onClick={addQuote}
                disabled={!newQuoteText.trim() || !newQuoteAuthor.trim()}
                className="w-full"
                variant="timer"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Quote
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* AI Generator Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card className="glass p-6">
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="text-4xl">🤖</div>
                <h3 className="text-lg font-semibold text-foreground">AI Quote Generator</h3>
                <p className="text-muted-foreground">
                  Generate inspirational quotes tailored to your prompts using Google Gemini AI
                </p>
              </div>

              {/* Custom Prompt Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Prompt</label>
                  <Textarea
                    placeholder="Enter your prompt for quote generation (e.g., 'motivation for entrepreneurs', 'quotes about overcoming fear')..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="glass min-h-20"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={generateCustomQuote}
                    disabled={isGenerating || !customPrompt.trim()}
                    variant="timer"
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate Quote
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={generateQuickQuote}
                    disabled={isGenerating}
                    variant="secondary"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Quick Generate
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent AI Generated Quotes */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Recent AI Quotes</h4>
            {quotes.filter(q => q.isAiGenerated).slice(0, 3).map(quote => (
              <Card key={quote.id} className="glass p-4">
                <blockquote className="text-sm italic text-foreground">
                  "{quote.text}"
                </blockquote>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">— {quote.author}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(quote.id)}
                      className={quote.isFavorite ? 'text-red-500' : 'text-muted-foreground'}
                    >
                      <Heart className={`h-3 w-3 ${quote.isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Quote</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this AI-generated quote?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteQuote(quote.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}