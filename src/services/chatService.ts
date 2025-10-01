import { supabase } from '@/lib/supabase'

export interface ChatConversation {
  id: string
  user_id: string
  title?: string
  summary?: string
  is_active: boolean
  message_count: number
  last_message_at: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  conversation_id: string
  user_id: string
  content: string
  sender: 'user' | 'ai'
  message_type: 'text' | 'suggestion' | 'tip' | 'encouragement'
  metadata?: any
  tokens_used?: number
  response_time_ms?: number
  created_at: string
}

export interface CreateMessageData {
  conversation_id: string
  user_id: string
  content: string
  sender: 'user' | 'ai'
  message_type?: 'text' | 'suggestion' | 'tip' | 'encouragement'
  metadata?: any
  tokens_used?: number
  response_time_ms?: number
}

export class ChatService {
  // ===== CONVERSATION MANAGEMENT =====
  
  // Get user's conversations
  static async getUserConversations(userId: string, limit = 20): Promise<ChatConversation[]> {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  // Get active conversation or create new one
  static async getOrCreateActiveConversation(userId: string): Promise<ChatConversation> {
    const { data, error } = await supabase
      .rpc('get_or_create_active_conversation', { p_user_id: userId })

    if (error) throw error

    // Fetch the conversation details
    const { data: conversation, error: fetchError } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', data)
      .single()

    if (fetchError) throw fetchError
    return conversation
  }

  // Create new conversation
  static async createConversation(userId: string, title?: string): Promise<ChatConversation> {
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: userId,
        title: title,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update conversation
  static async updateConversation(conversationId: string, updates: Partial<ChatConversation>): Promise<ChatConversation> {
    const { data, error } = await supabase
      .from('chat_conversations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Archive conversation (set inactive)
  static async archiveConversation(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_conversations')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)

    if (error) throw error
  }

  // Delete conversation and all messages
  static async deleteConversation(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId)

    if (error) throw error
  }

  // ===== MESSAGE MANAGEMENT =====
  
  // Get conversation messages
  static async getConversationMessages(conversationId: string, limit = 100): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  // Add message to conversation
  static async addMessage(messageData: CreateMessageData): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        ...messageData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Add user message
  static async addUserMessage(conversationId: string, userId: string, content: string): Promise<ChatMessage> {
    return this.addMessage({
      conversation_id: conversationId,
      user_id: userId,
      content,
      sender: 'user',
      message_type: 'text',
    })
  }

  // Add AI message
  static async addAIMessage(
    conversationId: string, 
    userId: string, 
    content: string, 
    messageType: 'text' | 'suggestion' | 'tip' | 'encouragement' = 'text',
    metadata?: any,
    tokensUsed?: number,
    responseTimeMs?: number
  ): Promise<ChatMessage> {
    return this.addMessage({
      conversation_id: conversationId,
      user_id: userId,
      content,
      sender: 'ai',
      message_type: messageType,
      metadata,
      tokens_used: tokensUsed,
      response_time_ms: responseTimeMs,
    })
  }

  // Update message
  static async updateMessage(messageId: string, updates: Partial<ChatMessage>): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .update(updates)
      .eq('id', messageId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete message
  static async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId)

    if (error) throw error
  }

  // ===== CONVERSATION HISTORY =====
  
  // Get recent conversations with last message
  static async getRecentConversationsWithLastMessage(userId: string, limit = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select(`
        *,
        last_message:chat_messages(content, sender, created_at)
      `)
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  // Search conversations by content
  static async searchConversations(userId: string, searchTerm: string): Promise<ChatConversation[]> {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%`)
      .order('last_message_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get conversation statistics
  static async getConversationStats(userId: string): Promise<{
    totalConversations: number
    totalMessages: number
    averageMessagesPerConversation: number
    mostActiveDay: string
  }> {
    // Get total conversations
    const { count: totalConversations, error: convError } = await supabase
      .from('chat_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (convError) throw convError

    // Get total messages
    const { count: totalMessages, error: msgError } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (msgError) throw msgError

    // Calculate average messages per conversation
    const averageMessagesPerConversation = totalConversations > 0 
      ? Math.round((totalMessages || 0) / totalConversations) 
      : 0

    // Get most active day (simplified - would need more complex query for real implementation)
    const mostActiveDay = 'Monday' // Placeholder

    return {
      totalConversations: totalConversations || 0,
      totalMessages: totalMessages || 0,
      averageMessagesPerConversation,
      mostActiveDay,
    }
  }

  // ===== CONVERSATION CONTEXT =====
  
  // Get conversation context for AI (last N messages)
  static async getConversationContext(conversationId: string, contextLength = 10): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(contextLength)

    if (error) throw error
    
    // Return in chronological order for AI context
    return (data || []).reverse()
  }

  // Generate conversation summary (for long conversations)
  static async generateConversationSummary(conversationId: string): Promise<string> {
    const messages = await this.getConversationMessages(conversationId)
    
    // Simple summary generation (could be enhanced with AI)
    const userMessages = messages.filter(m => m.sender === 'user')
    const topics = userMessages.map(m => m.content.substring(0, 50)).join(', ')
    
    return `Conversation about: ${topics}`
  }

  // ===== UTILITY METHODS =====
  
  // Clear old conversations (data retention)
  static async clearOldConversations(userId: string, daysOld = 90): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const { data, error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('user_id', userId)
      .lt('last_message_at', cutoffDate.toISOString())
      .select('id')

    if (error) throw error
    return data?.length || 0
  }

  // Export conversation data (GDPR compliance)
  static async exportUserChatData(userId: string): Promise<{
    conversations: ChatConversation[]
    messages: ChatMessage[]
  }> {
    const conversations = await this.getUserConversations(userId, 1000)
    
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return {
      conversations,
      messages: messages || [],
    }
  }
}