import { useCallback } from 'react'
import { usePersistedState } from './usePersistedState'
import { useQuotes, useRandomQuote, useUserCustomQuotes, useCreateQuote, useUpdateQuote, useDeleteQuote } from './useSupabaseQueries'
import { useAuth } from './useAuth'
import { QuoteService } from '@/services/quoteService'
import { generateGeminiResponse } from '@/lib/gemini'
import { useGeminiSettings } from '@/hooks/useGeminiSettings'

export interface LocalQuote {
  id: string
  content: string
  author: string | null
  category: string | null
  is_custom: boolean
  isFavorite?: boolean
  isAiGenerated?: boolean
  created_at: string
  isLocal?: boolean // Flag for offline-created quotes
}

interface QuotesState {
  localQuotes: LocalQuote[]
  selectedCategory: string
  searchTerm: string
  favorites: string[] // Array of quote IDs that are favorited
}

const DEFAULT_QUOTES_STATE: QuotesState = {
  localQuotes: [],
  selectedCategory: 'all',
  searchTerm: '',
  favorites: []
}

/**
 * SaaS-compliant quotes state management
 * - Offline-first approach
 * - Optimistic updates
 * - Automatic sync with database
 * - AI quote generation
 * - Favorites management
 */
export function useQuotesState() {
  const { user } = useAuth()
  const { settings: geminiSettings } = useGeminiSettings()
  
  // Database queries
  const { data: remoteQuotes = [], isLoading } = useQuotes(user?.id)
  const { data: userCustomQuotes = [] } = useUserCustomQuotes()
  const createQuote = useCreateQuote()
  const updateQuote = useUpdateQuote()
  const deleteQuote = useDeleteQuote()

  // Local state that persists across sessions
  const [quotesState, setQuotesState] = usePersistedState<QuotesState>(
    'quotes-state',
    DEFAULT_QUOTES_STATE,
    {
      syncToDatabase: true,
      storageType: 'localStorage'
    }
  )

  // Merge local and remote quotes, prioritizing remote for conflicts
  const allQuotes = useCallback(() => {
    const remoteQuoteIds = new Set(remoteQuotes.map(q => q.id))
    const localOnlyQuotes = quotesState.localQuotes.filter(q => !remoteQuoteIds.has(q.id))
    
    // Convert remote quotes to LocalQuote format
    const formattedRemoteQuotes: LocalQuote[] = remoteQuotes.map(q => ({
      id: q.id,
      content: q.content,
      author: q.author,
      category: q.category,
      is_custom: q.is_custom,
      isFavorite: quotesState.favorites.includes(q.id),
      isAiGenerated: q.category === 'AI Generated',
      created_at: q.created_at,
      isLocal: false
    }))
    
    return [...formattedRemoteQuotes, ...localOnlyQuotes].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [remoteQuotes, quotesState.localQuotes, quotesState.favorites])

  // Filter quotes based on current filters
  const filteredQuotes = useCallback(() => {
    const quotes = allQuotes()
    
    return quotes.filter(quote => {
      // Search filter
      const matchesSearch = !quotesState.searchTerm || 
        quote.content.toLowerCase().includes(quotesState.searchTerm.toLowerCase()) ||
        (quote.author && quote.author.toLowerCase().includes(quotesState.searchTerm.toLowerCase()))
      
      // Category filter
      const matchesCategory = quotesState.selectedCategory === 'all' ||
        (quotesState.selectedCategory === 'favorites' && quote.isFavorite) ||
        (quotesState.selectedCategory === 'custom' && quote.is_custom) ||
        (quotesState.selectedCategory === 'ai' && quote.isAiGenerated) ||
        quote.category === quotesState.selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [allQuotes, quotesState.searchTerm, quotesState.selectedCategory])

  // Get available categories
  const categories = useCallback(() => {
    const quotes = allQuotes()
    const uniqueCategories = new Set(quotes.map(q => q.category).filter(Boolean))
    
    return [
      'all',
      'favorites',
      'custom',
      'ai',
      ...Array.from(uniqueCategories)
    ]
  }, [allQuotes])

  // Create quote with optimistic update
  const createQuoteOptimistic = useCallback(async (quoteData: {
    content: string
    author?: string
    category?: string
    isAiGenerated?: boolean
  }) => {
    const tempId = `temp_${Date.now()}`
    const now = new Date().toISOString()
    
    const newQuote: LocalQuote = {
      id: tempId,
      content: quoteData.content,
      author: quoteData.author || null,
      category: quoteData.category || (quoteData.isAiGenerated ? 'AI Generated' : 'Custom'),
      is_custom: true,
      isFavorite: false,
      isAiGenerated: quoteData.isAiGenerated || false,
      created_at: now,
      isLocal: true
    }

    // Optimistic update - add to local state immediately
    setQuotesState(prev => ({
      ...prev,
      localQuotes: [...prev.localQuotes, newQuote]
    }))

    if (user) {
      try {
        // Sync to database
        const createdQuote = await createQuote.mutateAsync({
          user_id: user.id,
          content: quoteData.content,
          author: quoteData.author || null,
          category: quoteData.category || (quoteData.isAiGenerated ? 'AI Generated' : 'Custom'),
          is_custom: true
        })

        // Remove temp quote and let React Query handle the real one
        setQuotesState(prev => ({
          ...prev,
          localQuotes: prev.localQuotes.filter(q => q.id !== tempId)
        }))

        return createdQuote
      } catch (error) {
        console.error('Failed to create quote in database:', error)
        // Keep the local quote for later sync
        return newQuote
      }
    }

    return newQuote
  }, [user, createQuote, setQuotesState])

  // Update quote with optimistic update
  const updateQuoteOptimistic = useCallback(async (quoteId: string, updates: {
    content?: string
    author?: string
    category?: string
  }) => {
    // Optimistic update for local quotes
    setQuotesState(prev => ({
      ...prev,
      localQuotes: prev.localQuotes.map(q => 
        q.id === quoteId ? { ...q, ...updates } : q
      )
    }))

    if (user && !quoteId.startsWith('temp_')) {
      try {
        await updateQuote.mutateAsync({ quoteId, updates })
      } catch (error) {
        console.error('Failed to update quote in database:', error)
        // Could implement revert logic here
      }
    }
  }, [user, updateQuote, setQuotesState])

  // Delete quote with optimistic update
  const deleteQuoteOptimistic = useCallback(async (quoteId: string) => {
    // Optimistic update
    setQuotesState(prev => ({
      ...prev,
      localQuotes: prev.localQuotes.filter(q => q.id !== quoteId),
      favorites: prev.favorites.filter(id => id !== quoteId)
    }))

    if (user && !quoteId.startsWith('temp_')) {
      try {
        await deleteQuote.mutateAsync(quoteId)
      } catch (error) {
        console.error('Failed to delete quote from database:', error)
        // Could implement revert logic here
      }
    }
  }, [user, deleteQuote, setQuotesState])

  // Toggle favorite
  const toggleFavorite = useCallback((quoteId: string) => {
    setQuotesState(prev => ({
      ...prev,
      favorites: prev.favorites.includes(quoteId)
        ? prev.favorites.filter(id => id !== quoteId)
        : [...prev.favorites, quoteId]
    }))
  }, [setQuotesState])

  // Set search term
  const setSearchTerm = useCallback((term: string) => {
    setQuotesState(prev => ({ ...prev, searchTerm: term }))
  }, [setQuotesState])

  // Set category filter
  const setSelectedCategory = useCallback((category: string) => {
    setQuotesState(prev => ({ ...prev, selectedCategory: category }))
  }, [setQuotesState])

  // Generate AI quote
  const generateAIQuote = useCallback(async (prompt: string) => {
    if (!geminiSettings.isConfigured) {
      throw new Error('AI not configured. Please set up your Gemini API key.')
    }

    const generatedText = await generateGeminiResponse(
      geminiSettings.apiKey!,
      `Generate an inspirational quote based on this prompt: "${prompt}". Return only the quote text without quotes, followed by a line break, then "— [Author Name]" where Author Name should be an appropriate fictional or real author that fits the quote's style and theme.`,
      geminiSettings.model!
    )
    
    // Parse the response to extract quote and author
    const lines = generatedText.trim().split('\n')
    const quoteText = lines[0].replace(/^["']|["']$/g, '') // Remove quotes if present
    const authorLine = lines.find(line => line.includes('—')) || '— AI Assistant'
    const author = authorLine.replace('—', '').trim()

    return createQuoteOptimistic({
      content: quoteText,
      author: author,
      category: 'AI Generated',
      isAiGenerated: true
    })
  }, [geminiSettings, createQuoteOptimistic])

  // Get random quote
  const getRandomQuote = useCallback(() => {
    const quotes = allQuotes()
    if (quotes.length === 0) return null
    
    const randomIndex = Math.floor(Math.random() * quotes.length)
    return quotes[randomIndex]
  }, [allQuotes])

  // Sync local quotes to database (for offline-created quotes)
  const syncLocalQuotes = useCallback(async () => {
    if (!user) return

    const localQuotes = quotesState.localQuotes.filter(q => q.isLocal)
    
    for (const localQuote of localQuotes) {
      try {
        await createQuote.mutateAsync({
          user_id: user.id,
          content: localQuote.content,
          author: localQuote.author,
          category: localQuote.category,
          is_custom: true
        })

        // Remove from local quotes after successful sync
        setQuotesState(prev => ({
          ...prev,
          localQuotes: prev.localQuotes.filter(q => q.id !== localQuote.id)
        }))
      } catch (error) {
        console.error('Failed to sync local quote:', error)
      }
    }
  }, [user, quotesState.localQuotes, createQuote, setQuotesState])

  return {
    // State
    quotes: filteredQuotes(),
    allQuotes: allQuotes(),
    categories: categories(),
    searchTerm: quotesState.searchTerm,
    selectedCategory: quotesState.selectedCategory,
    localQuoteCount: quotesState.localQuotes.filter(q => q.isLocal).length,
    
    // Computed
    favoriteQuotes: allQuotes().filter(q => q.isFavorite),
    customQuotes: allQuotes().filter(q => q.is_custom),
    aiQuotes: allQuotes().filter(q => q.isAiGenerated),
    
    // Actions
    createQuote: createQuoteOptimistic,
    updateQuote: updateQuoteOptimistic,
    deleteQuote: deleteQuoteOptimistic,
    toggleFavorite,
    setSearchTerm,
    setSelectedCategory,
    generateAIQuote,
    getRandomQuote,
    syncLocalQuotes,
    
    // Status
    isLoading,
    isSyncing: createQuote.isPending || updateQuote.isPending || deleteQuote.isPending,
    isAIConfigured: geminiSettings.isConfigured
  }
}