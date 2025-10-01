import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Heart, Sparkles, Download, Share, Trash2, Search, Filter, Edit3, Plus, Bot, Wand2, Loader2, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useQuotesState } from '@/hooks/useQuotesState';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function EnhancedQuotesDashboard() {
  const { user } = useAuth();
  const {
    quotes,
    allQuotes,
    categories,
    searchTerm,
    selectedCategory,
    localQuoteCount,
    favoriteQuotes,
    customQuotes,
    aiQuotes,
    isLoading,
    isSyncing,
    isAIConfigured,
    createQuote,
    updateQuote,
    deleteQuote,
    toggleFavorite,
    setSearchTerm,
    setSelectedCategory,
    generateAIQuote,
    syncLocalQuotes
  } = useQuotesState();

  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteAuthor, setNewQuoteAuthor] = useState('');
  const [newQuoteCategory, setNewQuoteCategory] = useState('');
  const [editingQuote, setEditingQuote] = useState<{
    id: string;
    content: string;
    author: string;
    category: string;
  } | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const addQuote = async () => {
    if (!newQuoteText.trim() || !newQuoteAuthor.trim()) return;

    try {
      await createQuote({
        content: newQuoteText.trim(),
        author: newQuoteAuthor.trim(),
        category: newQuoteCategory || 'Custom'
      });

      setNewQuoteText('');
      setNewQuoteAuthor('');
      setNewQuoteCategory('');

      toast.success('Quote added successfully!');
    } catch (error) {
      toast.error('Failed to add quote');
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    try {
      await deleteQuote(quoteId);
      toast.success('Quote deleted successfully');
    } catch (error) {
      toast.error('Failed to delete quote');
    }
  };

  const handleToggleFavorite = (quoteId: string) => {
    toggleFavorite(quoteId);
    const quote = allQuotes.find(q => q.id === quoteId);
    if (quote) {
      toast.success(quote.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    }
  };

  const generateCustomQuote = async () => {
    if (!customPrompt.trim()) {
      toast.error('Please enter a prompt for quote generation.');
      return;
    }

    if (!isAIConfigured) {
      toast.error('Please configure your Gemini API key and select a model in Settings first.');
      return;
    }

    setIsGenerating(true);

    try {
      await generateAIQuote(customPrompt);
      setCustomPrompt('');
      toast.success('Quote generated successfully! ✨');
    } catch (error) {
      console.error('Error generating quote:', error);
      toast.error('Failed to generate quote. Please check your API key and try again.');
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

  const handleSyncLocal = async () => {
    try {
      await syncLocalQuotes();
      toast.success('Local quotes synced to database');
    } catch (error) {
      toast.error('Failed to sync local quotes');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inspiration Library</h2>
          <p className="text-muted-foreground">
            {user ? 'Your personal collection synced across devices' : 'Sign in to save and sync quotes'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sync Status Indicator */}
          {isSyncing ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          ) : user ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-gray-400" />
          )}

          {/* Local Quotes Badge */}
          {localQuoteCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {localQuoteCount} local
            </Badge>
          )}

          {/* Sync Button */}
          {localQuoteCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncLocal}
              disabled={!user || isSyncing}
              className="text-xs"
            >
              Sync Local
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{allQuotes.length}</div>
          <div className="text-sm text-muted-foreground">Total Quotes</div>
        </Card>
        <Card className="glass p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{favoriteQuotes.length}</div>
          <div className="text-sm text-muted-foreground">Favorites</div>
        </Card>
        <Card className="glass p-4 text-center">
          <div className="text-2xl font-bold text-blue-500">{customQuotes.length}</div>
          <div className="text-sm text-muted-foreground">Custom</div>
        </Card>
        <Card className="glass p-4 text-center">
          <div className="text-2xl font-bold text-purple-500">{aiQuotes.length}</div>
          <div className="text-sm text-muted-foreground">AI Generated</div>
        </Card>
      </div>

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
                placeholder={user ? "Search quotes..." : "Sign in to search your quotes"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass"
                disabled={isSyncing}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                        category === 'custom' ? 'Custom Quotes' :
                          category === 'ai' ? 'AI Generated' :
                            category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quotes Grid */}
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your quotes...</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quotes.map(quote => (
                <Card key={quote.id} className={`glass p-6 transition-all hover:scale-105 hover:glow-primary ${quote.isLocal ? 'border-yellow-500/50 bg-yellow-500/10' : ''}`}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-2">
                        <Badge variant={quote.isAiGenerated ? "secondary" : "outline"} className="text-xs">
                          {quote.isAiGenerated ? (
                            <><Bot className="mr-1 h-3 w-3" /> AI</>
                          ) : (
                            quote.category || 'General'
                          )}
                        </Badge>
                        {quote.isLocal && (
                          <Badge variant="outline" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Local
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFavorite(quote.id)}
                          className={quote.isFavorite ? 'text-red-500' : 'text-muted-foreground'}
                          disabled={isSyncing}
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
                                  value={editingQuote.content}
                                  onChange={(e) => setEditingQuote(prev =>
                                    prev ? { ...prev, content: e.target.value } : null
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
                                <Button 
                                  onClick={async () => {
                                    if (editingQuote) {
                                      try {
                                        await updateQuote(editingQuote.id, {
                                          content: editingQuote.content,
                                          author: editingQuote.author,
                                          category: editingQuote.category
                                        });
                                        setEditingQuote(null);
                                        toast.success('Quote updated successfully');
                                      } catch (error) {
                                        toast.error('Failed to update quote');
                                      }
                                    }
                                  }} 
                                  className="w-full"
                                >
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
                                onClick={() => handleDeleteQuote(quote.id)}
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
                      "{quote.content}"
                    </blockquote>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>— {quote.author || 'Unknown'}</span>
                      <span>{new Date(quote.created_at).toLocaleDateString()}</span>
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
          )}

          {!isLoading && quotes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-muted-foreground">
                {selectedCategory === 'all'
                  ? 'No quotes in your collection yet. Create some below!'
                  : `No ${selectedCategory} quotes found.`}
              </p>
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
                disabled={!newQuoteText.trim() || !newQuoteAuthor.trim() || isSyncing}
                className="w-full"
                variant="timer"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Quote
                  </>
                )}
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
            {aiQuotes.slice(0, 3).map(quote => (
              <Card key={quote.id} className="glass p-4">
                <blockquote className="text-sm italic text-foreground">
                  "{quote.content}"
                </blockquote>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">— {quote.author}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(quote.id)}
                      className={quote.isFavorite ? 'text-red-500' : 'text-muted-foreground'}
                      disabled={isSyncing}
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
                            onClick={() => handleDeleteQuote(quote.id)}
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