import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type FocusSession = Database['public']['Tables']['focus_sessions']['Row']
type FocusSessionInsert = Database['public']['Tables']['focus_sessions']['Insert']
type FocusSessionUpdate = Database['public']['Tables']['focus_sessions']['Update']

export class SessionService {
  // Create a new focus session
  static async createSession(sessionData: FocusSessionInsert): Promise<FocusSession> {
    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({
        ...sessionData,
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update session (mark as completed, etc.)
  static async updateSession(sessionId: string, updates: FocusSessionUpdate): Promise<FocusSession> {
    const { data, error } = await supabase
      .from('focus_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Complete a session
  static async completeSession(sessionId: string): Promise<FocusSession> {
    return this.updateSession(sessionId, {
      completed: true,
      completed_at: new Date().toISOString(),
    })
  }

  // Get user sessions
  static async getUserSessions(userId: string, limit = 50): Promise<FocusSession[]> {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  // Get session statistics
  static async getSessionStats(userId: string, dateFrom?: string, dateTo?: string) {
    let query = supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    const { data, error } = await query

    if (error) throw error

    const sessions = data || []
    
    return {
      totalSessions: sessions.length,
      totalFocusTime: sessions
        .filter(s => s.session_type === 'focus')
        .reduce((sum, s) => sum + s.duration_minutes, 0),
      totalBreakTime: sessions
        .filter(s => s.session_type !== 'focus')
        .reduce((sum, s) => sum + s.duration_minutes, 0),
      averageSessionLength: sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / sessions.length 
        : 0,
      sessionsByType: {
        focus: sessions.filter(s => s.session_type === 'focus').length,
        short_break: sessions.filter(s => s.session_type === 'short_break').length,
        long_break: sessions.filter(s => s.session_type === 'long_break').length,
      },
    }
  }

  // Get today's sessions
  static async getTodaySessions(userId: string): Promise<FocusSession[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Delete session
  static async deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('focus_sessions')
      .delete()
      .eq('id', sessionId)

    if (error) throw error
  }
}