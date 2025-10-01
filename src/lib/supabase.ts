import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sbiykywpmkqhmgzisrez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiaXlreXdwbWtxaG1nemlzcmV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDIxNjksImV4cCI6MjA3NDc3ODE2OX0.ROWV0_ECEPMdAMHdoCkEqFrK1rOi4JQGr1JnYmfElGI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      focus_sessions: {
        Row: {
          id: string
          user_id: string
          session_type: 'focus' | 'short_break' | 'long_break'
          duration_minutes: number
          completed: boolean
          started_at: string
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_type: 'focus' | 'short_break' | 'long_break'
          duration_minutes: number
          completed?: boolean
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_type?: 'focus' | 'short_break' | 'long_break'
          duration_minutes?: number
          completed?: boolean
          started_at?: string
          completed_at?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          completed: boolean
          priority: 'low' | 'medium' | 'high'
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          completed?: boolean
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          completed?: boolean
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          updated_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          user_id: string | null
          content: string
          author: string | null
          category: string | null
          is_custom: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          content: string
          author?: string | null
          category?: string | null
          is_custom?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          content?: string
          author?: string | null
          category?: string | null
          is_custom?: boolean
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          focus_duration: number
          short_break_duration: number
          long_break_duration: number
          sessions_until_long_break: number
          notifications_enabled: boolean
          sound_enabled: boolean
          theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          focus_duration?: number
          short_break_duration?: number
          long_break_duration?: number
          sessions_until_long_break?: number
          notifications_enabled?: boolean
          sound_enabled?: boolean
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          focus_duration?: number
          short_break_duration?: number
          long_break_duration?: number
          sessions_until_long_break?: number
          notifications_enabled?: boolean
          sound_enabled?: boolean
          theme?: string
          updated_at?: string
        }
      }
    }
  }
}