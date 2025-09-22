import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Sparkles, Download, Share, Trash2, Search, Filter } from 'lucide-react';

interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  isFavorite: boolean;
  isAiGenerated: boolean;
  createdAt: Date;
}

export function QuotesDashboard() {
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
  };

  const generateAiQuote = async () => {
    // Simulate AI quote generation
    const aiQuotes = [
      'Productivity is never an accident. It is the result of commitment to excellence, intelligent planning, and focused effort.',
      'The greatest weapon against stress is our ability to choose one thought over another.',
      'Focus on being productive instead of busy.',
      'Small daily improvements over time lead to stunning results.',
    ];
    
    const randomQuote = aiQuotes[Math.floor(Math.random() * aiQuotes.length)];
    
    const aiQuote: Quote = {
      id: Date.now().toString(),
      text: randomQuote,
      author: 'AI Assistant',
      category: 'AI Generated',
      isFavorite: false,
      isAiGenerated: true,
      createdAt: new Date()
    };
    
    setQuotes(prev => [aiQuote, ...prev]);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass">
          <TabsTrigger value="browse">Browse Quotes</TabsTrigger>
          <TabsTrigger value="create">Create Quote</TabsTrigger>
          <TabsTrigger value="ai">AI Generator</TabsTrigger>
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
                        <><Sparkles className="mr-1 h-3 w-3" /> AI</>
                      ) : (
                        quote.category
                      )}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(quote.id)}
                      className={quote.isFavorite ? 'text-red-500' : 'text-muted-foreground'}
                    >
                      <Heart className={`h-4 w-4 ${quote.isFavorite ? 'fill-current' : ''}`} />
                    </Button>
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
            <h3 className="text-lg font-semibold mb-4 text-foreground">Add New Quote</h3>
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
                Add Quote
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* AI Generator Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card className="glass p-6">
            <div className="text-center space-y-4">
              <div className="text-4xl">🤖</div>
              <h3 className="text-lg font-semibold text-foreground">AI Quote Generator</h3>
              <p className="text-muted-foreground">
                Generate inspirational quotes tailored to your current mood and goals
              </p>
              <Button 
                onClick={generateAiQuote}
                variant="secondary"
                size="lg"
                className="transition-spring"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Quote
              </Button>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(quote.id)}
                    className={quote.isFavorite ? 'text-red-500' : 'text-muted-foreground'}
                  >
                    <Heart className={`h-3 w-3 ${quote.isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}