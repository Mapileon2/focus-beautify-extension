import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export class TaskService {
  // Create a new task
  static async createTask(taskData: TaskInsert): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get user tasks
  static async getUserTasks(userId: string, completed?: boolean): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (completed !== undefined) {
      query = query.eq('completed', completed)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  // Update task
  static async updateTask(taskId: string, updates: TaskUpdate): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Toggle task completion
  static async toggleTaskCompletion(taskId: string): Promise<Task> {
    // First get the current task to toggle its completion status
    const { data: currentTask, error: fetchError } = await supabase
      .from('tasks')
      .select('completed')
      .eq('id', taskId)
      .single()

    if (fetchError) throw fetchError

    return this.updateTask(taskId, {
      completed: !currentTask.completed,
    })
  }

  // Delete task
  static async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) throw error
  }

  // Get tasks by priority
  static async getTasksByPriority(userId: string, priority: 'low' | 'medium' | 'high'): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('priority', priority)
      .eq('completed', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get overdue tasks
  static async getOverdueTasks(userId: string): Promise<Task[]> {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .not('due_date', 'is', null)
      .lt('due_date', now)
      .order('due_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Get tasks due today
  static async getTasksDueToday(userId: string): Promise<Task[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .gte('due_date', today.toISOString())
      .lt('due_date', tomorrow.toISOString())
      .order('priority', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Search tasks
  static async searchTasks(userId: string, searchTerm: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}