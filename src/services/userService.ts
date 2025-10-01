import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

// Enhanced types for new tables
interface UserPreferences {
  id?: string
  user_id: string
  preferred_session_length?: number
  preferred_break_length?: number
  preferred_long_break_length?: number
  sessions_before_long_break?: number
  auto_start_breaks?: boolean
  auto_start_sessions?: boolean
  email_notifications?: boolean
  push_notifications?: boolean
  session_reminders?: boolean
  achievement_notifications?: boolean
  weekly_reports?: boolean
  break_reminders?: boolean
  theme?: 'light' | 'dark' | 'system'
  language?: string
  timezone?: string
  date_format?: string
  time_format?: '12h' | '24h'
  dashboard_layout?: any
  profile_public?: boolean
  show_activity?: boolean
  show_achievements?: boolean
  show_statistics?: boolean
  allow_friend_requests?: boolean
  daily_focus_goal?: number
  weekly_focus_goal?: number
  monthly_focus_goal?: number
}

interface UserAchievement {
  id?: string
  user_id: string
  achievement_id: string
  achievement_name: string
  achievement_description?: string
  achievement_icon?: string
  achievement_category?: string
  unlocked_at?: string
  progress?: number
  max_progress?: number
  metadata?: any
  points_awarded?: number
}

interface UserGoal {
  id?: string
  user_id: string
  goal_type: 'daily' | 'weekly' | 'monthly' | 'custom'
  goal_name: string
  goal_description?: string
  target_value: number
  current_value?: number
  unit?: string
  start_date: string
  end_date?: string
  is_active?: boolean
  is_completed?: boolean
  completed_at?: string
}

interface UserStatistics {
  id?: string
  user_id: string
  total_sessions?: number
  completed_sessions?: number
  total_focus_time?: number
  total_break_time?: number
  average_session_length?: number
  current_streak?: number
  longest_streak?: number
  last_session_date?: string
  total_achievements?: number
  total_points?: number
  current_level?: number
  experience_points?: number
  today_focus_time?: number
  week_focus_time?: number
  month_focus_time?: number
  last_calculated_at?: string
}

interface UserActivityLog {
  user_id: string
  activity_type: string
  activity_description?: string
  activity_data?: any
  ip_address?: string
  user_agent?: string
  session_id?: string
}

export class UserService {
  // ===== PROFILE MANAGEMENT =====
  
  // Create user profile with initialization
  static async createUserProfile(userData: UserInsert): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        ...userData,
        onboarding_completed: false,
        profile_completion_score: this.calculateProfileCompletion(userData),
        last_active_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    
    // Initialize user profile data (preferences, statistics)
    await this.initializeUserProfile(data.id)
    
    return data
  }

  // Get comprehensive user profile
  static async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Update user profile with completion score calculation
  static async updateUserProfile(userId: string, updates: UserUpdate): Promise<User> {
    const profileCompletion = this.calculateProfileCompletion(updates)
    
    const { data, error } = await supabase
      .from('users')
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString(),
        profile_completion_score: profileCompletion,
        last_active_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    
    // Log profile update activity
    await this.logUserActivity(userId, 'profile_updated', 'User profile information updated', updates)
    
    return data
  }

  // Calculate profile completion percentage
  static calculateProfileCompletion(userData: any): number {
    const fields = ['full_name', 'bio', 'location', 'avatar_url', 'website']
    const completedFields = fields.filter(field => userData[field] && userData[field].trim() !== '')
    return Math.round((completedFields.length / fields.length) * 100)
  }

  // Complete onboarding process
  static async completeOnboarding(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ 
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) throw error
    
    await this.logUserActivity(userId, 'onboarding_completed', 'User completed onboarding process')
  }

  // ===== PREFERENCES MANAGEMENT =====
  
  // Get user preferences
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Update user preferences
  static async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    
    await this.logUserActivity(userId, 'preferences_updated', 'User preferences updated', preferences)
    
    return data
  }

  // ===== ACHIEVEMENTS MANAGEMENT =====
  
  // Get user achievements
  static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Unlock achievement
  static async unlockAchievement(userId: string, achievementData: Partial<UserAchievement>): Promise<UserAchievement> {
    const { data, error } = await supabase
      .from('user_achievements')
      .upsert({
        user_id: userId,
        unlocked_at: new Date().toISOString(),
        ...achievementData,
      })
      .select()
      .single()

    if (error) throw error
    
    // Update user statistics with achievement points
    if (achievementData.points_awarded) {
      await this.addExperiencePoints(userId, achievementData.points_awarded)
    }
    
    await this.logUserActivity(userId, 'achievement_unlocked', `Achievement unlocked: ${achievementData.achievement_name}`, achievementData)
    
    return data
  }

  // Update achievement progress
  static async updateAchievementProgress(userId: string, achievementId: string, progress: number): Promise<void> {
    const { error } = await supabase
      .from('user_achievements')
      .update({ 
        progress,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)

    if (error) throw error
  }

  // ===== GOALS MANAGEMENT =====
  
  // Get user goals
  static async getUserGoals(userId: string, activeOnly = false): Promise<UserGoal[]> {
    let query = supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Create user goal
  static async createUserGoal(goalData: UserGoal): Promise<UserGoal> {
    const { data, error } = await supabase
      .from('user_goals')
      .insert({
        ...goalData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    
    await this.logUserActivity(goalData.user_id, 'goal_created', `Goal created: ${goalData.goal_name}`, goalData)
    
    return data
  }

  // Update goal progress
  static async updateGoalProgress(userId: string, goalId: string, currentValue: number): Promise<UserGoal> {
    const { data, error } = await supabase
      .from('user_goals')
      .update({ 
        current_value: currentValue,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    
    // Check if goal is completed
    if (currentValue >= data.target_value && !data.is_completed) {
      await this.completeGoal(userId, goalId)
    }
    
    return data
  }

  // Complete goal
  static async completeGoal(userId: string, goalId: string): Promise<void> {
    const { error } = await supabase
      .from('user_goals')
      .update({ 
        is_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .eq('user_id', userId)

    if (error) throw error
    
    await this.logUserActivity(userId, 'goal_completed', 'Goal completed')
    
    // Award experience points for goal completion
    await this.addExperiencePoints(userId, 50)
  }

  // ===== STATISTICS MANAGEMENT =====
  
  // Get user statistics
  static async getUserStatistics(userId: string): Promise<UserStatistics | null> {
    const { data, error } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Update user statistics
  static async updateUserStatistics(userId: string, stats: Partial<UserStatistics>): Promise<UserStatistics> {
    const { data, error } = await supabase
      .from('user_statistics')
      .upsert({
        user_id: userId,
        ...stats,
        last_calculated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Add experience points and calculate level
  static async addExperiencePoints(userId: string, points: number): Promise<void> {
    const stats = await this.getUserStatistics(userId)
    const newXP = (stats?.experience_points || 0) + points
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1

    await this.updateUserStatistics(userId, {
      experience_points: newXP,
      current_level: newLevel,
      total_points: (stats?.total_points || 0) + points,
    })

    await this.logUserActivity(userId, 'experience_gained', `Gained ${points} experience points`)
  }

  // ===== ACTIVITY LOGGING =====
  
  // Log user activity
  static async logUserActivity(userId: string, activityType: string, description?: string, data?: any): Promise<void> {
    const { error } = await supabase
      .from('user_activity_log')
      .insert({
        user_id: userId,
        activity_type: activityType,
        activity_description: description,
        activity_data: data,
        created_at: new Date().toISOString(),
      })

    if (error) console.error('Failed to log user activity:', error)
  }

  // Get user activity log
  static async getUserActivityLog(userId: string, limit = 50): Promise<UserActivityLog[]> {
    const { data, error } = await supabase
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  // ===== INITIALIZATION =====
  
  // Initialize user profile data
  static async initializeUserProfile(userId: string): Promise<void> {
    try {
      // Initialize preferences
      await supabase
        .from('user_preferences')
        .insert({ user_id: userId })
        .select()
        .single()

      // Initialize statistics
      await supabase
        .from('user_statistics')
        .insert({ user_id: userId })
        .select()
        .single()

      await this.logUserActivity(userId, 'profile_initialized', 'User profile data initialized')
    } catch (error) {
      console.error('Failed to initialize user profile:', error)
    }
  }

  // ===== LEGACY COMPATIBILITY =====
  
  // Get user settings (legacy compatibility)
  static async getUserSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Create or update user settings (legacy compatibility)
  static async upsertUserSettings(userId: string, settings: any) {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete user profile
  static async deleteUserProfile(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) throw error
  }
}