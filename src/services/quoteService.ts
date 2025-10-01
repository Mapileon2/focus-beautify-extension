import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Quote = Database['public']['Tables']['quotes']['Row']
type QuoteInsert = Database['public']['Tables']['quotes']['Insert']
type QuoteUpdate = Database['public']['Tables']['quotes']['Update']

export class QuoteService {
  // Create a new quote
  static async createQuote(quoteData: QuoteInsert): Promise<Quote> {
    const { data, error } = await supabase
      .from('quotes')
      .insert({
        ...quoteData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get all quotes (public and user's custom quotes)
  static async getQuotes(userId?: string, category?: string): Promise<Quote[]> {
    let query = supabase
      .from('quotes')
      .select('*')

    if (userId) {
      // Get public quotes and user's custom quotes
      query = query.or(`user_id.is.null,user_id.eq.${userId}`)
    } else {
      // Get only public quotes
      query = query.is('user_id', null)
    }

    if (category) {
      query = query.eq('category', category)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  // Get user's custom quotes
  static async getUserCustomQuotes(userId: string): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_custom', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get random quote
  static async getRandomQuote(userId?: string, category?: string): Promise<Quote | null> {
    let query = supabase
      .from('quotes')
      .select('*')

    if (userId) {
      query = query.or(`user_id.is.null,user_id.eq.${userId}`)
    } else {
      query = query.is('user_id', null)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error
    
    const quotes = data || []
    if (quotes.length === 0) return null

    const randomIndex = Math.floor(Math.random() * quotes.length)
    return quotes[randomIndex]
  }

  // Update quote
  static async updateQuote(quoteId: string, updates: QuoteUpdate): Promise<Quote> {
    const { data, error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', quoteId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete quote
  static async deleteQuote(quoteId: string): Promise<void> {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', quoteId)

    if (error) throw error
  }

  // Get quotes by category
  static async getQuotesByCategory(category: string, userId?: string): Promise<Quote[]> {
    return this.getQuotes(userId, category)
  }

  // Get all categories
  static async getCategories(userId?: string): Promise<string[]> {
    let query = supabase
      .from('quotes')
      .select('category')
      .not('category', 'is', null)

    if (userId) {
      query = query.or(`user_id.is.null,user_id.eq.${userId}`)
    } else {
      query = query.is('user_id', null)
    }

    const { data, error } = await query

    if (error) throw error

    const categories = [...new Set((data || []).map(q => q.category).filter(Boolean))]
    return categories as string[]
  }

  // Search quotes
  static async searchQuotes(searchTerm: string, userId?: string): Promise<Quote[]> {
    let query = supabase
      .from('quotes')
      .select('*')
      .or(`content.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`)

    if (userId) {
      query = query.or(`user_id.is.null,user_id.eq.${userId}`)
    } else {
      query = query.is('user_id', null)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return data || []
  }
}