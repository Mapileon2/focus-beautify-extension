import { useCallback } from 'react'
import { usePersistedState } from './usePersistedState'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useToggleTask } from './useSupabaseQueries'
import { useAuth } from './useAuth'

export interface LocalTask {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  created_at: string
  updated_at: string
  isLocal?: boolean // Flag for offline-created tasks
}

interface TaskState {
  localTasks: LocalTask[]
  selectedTaskId: string | null
  filter: 'all' | 'active' | 'completed'
  sortBy: 'created' | 'priority' | 'due_date'
}

const DEFAULT_TASK_STATE: TaskState = {
  localTasks: [],
  selectedTaskId: null,
  filter: 'all',
  sortBy: 'created'
}

/**
 * SaaS-compliant task state management
 * - Offline-first approach
 * - Optimistic updates
 * - Automatic sync with database
 * - Conflict resolution
 */
export function useTaskState() {
  const { user } = useAuth()
  const { data: remoteTasks = [], isLoading } = useTasks()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const toggleTask = useToggleTask()

  // Local state that persists across sessions
  const [taskState, setTaskState] = usePersistedState<TaskState>(
    'task-state',
    DEFAULT_TASK_STATE,
    {
      syncToDatabase: true,
      storageType: 'localStorage'
    }
  )

  // Merge local and remote tasks, prioritizing remote for conflicts
  const allTasks = useCallback(() => {
    const remoteTaskIds = new Set(remoteTasks.map(t => t.id))
    const localOnlyTasks = taskState.localTasks.filter(t => !remoteTaskIds.has(t.id))
    
    return [...remoteTasks, ...localOnlyTasks].sort((a, b) => {
      switch (taskState.sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        case 'created':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }, [remoteTasks, taskState.localTasks, taskState.sortBy])

  // Filter tasks based on current filter
  const filteredTasks = useCallback(() => {
    const tasks = allTasks()
    switch (taskState.filter) {
      case 'active':
        return tasks.filter(t => !t.completed)
      case 'completed':
        return tasks.filter(t => t.completed)
      case 'all':
      default:
        return tasks
    }
  }, [allTasks, taskState.filter])

  // Create task with optimistic update
  const createTaskOptimistic = useCallback(async (taskData: Omit<LocalTask, 'id' | 'created_at' | 'updated_at'>) => {
    const tempId = `temp_${Date.now()}`
    const now = new Date().toISOString()
    
    const newTask: LocalTask = {
      ...taskData,
      id: tempId,
      created_at: now,
      updated_at: now,
      isLocal: true
    }

    // Optimistic update - add to local state immediately
    setTaskState(prev => ({
      ...prev,
      localTasks: [...prev.localTasks, newTask]
    }))

    if (user) {
      try {
        // Sync to database
        const createdTask = await createTask.mutateAsync({
          user_id: user.id,
          title: taskData.title,
          description: taskData.description || null,
          priority: taskData.priority,
          due_date: taskData.due_date || null,
          completed: taskData.completed
        })

        // Remove temp task and let React Query handle the real one
        setTaskState(prev => ({
          ...prev,
          localTasks: prev.localTasks.filter(t => t.id !== tempId)
        }))

        return createdTask
      } catch (error) {
        console.error('Failed to create task in database:', error)
        // Keep the local task for later sync
        return newTask
      }
    }

    return newTask
  }, [user, createTask, setTaskState])

  // Update task with optimistic update
  const updateTaskOptimistic = useCallback(async (taskId: string, updates: Partial<LocalTask>) => {
    // Optimistic update
    setTaskState(prev => ({
      ...prev,
      localTasks: prev.localTasks.map(t => 
        t.id === taskId 
          ? { ...t, ...updates, updated_at: new Date().toISOString() }
          : t
      )
    }))

    if (user && !taskId.startsWith('temp_')) {
      try {
        await updateTask.mutateAsync({ taskId, updates })
      } catch (error) {
        console.error('Failed to update task in database:', error)
        // Revert optimistic update on failure
        setTaskState(prev => ({
          ...prev,
          localTasks: prev.localTasks.map(t => 
            t.id === taskId 
              ? { ...t, ...Object.fromEntries(Object.keys(updates).map(key => [key, (t as any)[key]])) }
              : t
          )
        }))
      }
    }
  }, [user, updateTask, setTaskState])

  // Toggle task completion
  const toggleTaskOptimistic = useCallback(async (taskId: string) => {
    const task = allTasks().find(t => t.id === taskId)
    if (!task) return

    await updateTaskOptimistic(taskId, { completed: !task.completed })

    if (user && !taskId.startsWith('temp_')) {
      try {
        await toggleTask.mutateAsync(taskId)
      } catch (error) {
        console.error('Failed to toggle task in database:', error)
      }
    }
  }, [allTasks, updateTaskOptimistic, user, toggleTask])

  // Delete task with optimistic update
  const deleteTaskOptimistic = useCallback(async (taskId: string) => {
    // Optimistic update
    setTaskState(prev => ({
      ...prev,
      localTasks: prev.localTasks.filter(t => t.id !== taskId),
      selectedTaskId: prev.selectedTaskId === taskId ? null : prev.selectedTaskId
    }))

    if (user && !taskId.startsWith('temp_')) {
      try {
        await deleteTask.mutateAsync(taskId)
      } catch (error) {
        console.error('Failed to delete task from database:', error)
        // Could implement revert logic here
      }
    }
  }, [user, deleteTask, setTaskState])

  // Set filter
  const setFilter = useCallback((filter: TaskState['filter']) => {
    setTaskState(prev => ({ ...prev, filter }))
  }, [setTaskState])

  // Set sort order
  const setSortBy = useCallback((sortBy: TaskState['sortBy']) => {
    setTaskState(prev => ({ ...prev, sortBy }))
  }, [setTaskState])

  // Select task
  const selectTask = useCallback((taskId: string | null) => {
    setTaskState(prev => ({ ...prev, selectedTaskId: taskId }))
  }, [setTaskState])

  // Sync local tasks to database (for offline-created tasks)
  const syncLocalTasks = useCallback(async () => {
    if (!user) return

    const localTasks = taskState.localTasks.filter(t => t.isLocal)
    
    for (const localTask of localTasks) {
      try {
        await createTask.mutateAsync({
          user_id: user.id,
          title: localTask.title,
          description: localTask.description || null,
          priority: localTask.priority,
          due_date: localTask.due_date || null,
          completed: localTask.completed
        })

        // Remove from local tasks after successful sync
        setTaskState(prev => ({
          ...prev,
          localTasks: prev.localTasks.filter(t => t.id !== localTask.id)
        }))
      } catch (error) {
        console.error('Failed to sync local task:', error)
      }
    }
  }, [user, taskState.localTasks, createTask, setTaskState])

  return {
    // State
    tasks: filteredTasks(),
    allTasks: allTasks(),
    selectedTask: allTasks().find(t => t.id === taskState.selectedTaskId) || null,
    filter: taskState.filter,
    sortBy: taskState.sortBy,
    
    // Computed
    activeTasks: allTasks().filter(t => !t.completed),
    completedTasks: allTasks().filter(t => t.completed),
    localTaskCount: taskState.localTasks.filter(t => t.isLocal).length,
    
    // Actions
    createTask: createTaskOptimistic,
    updateTask: updateTaskOptimistic,
    deleteTask: deleteTaskOptimistic,
    toggleTask: toggleTaskOptimistic,
    setFilter,
    setSortBy,
    selectTask,
    syncLocalTasks,
    
    // Status
    isLoading,
    isSyncing: createTask.isPending || updateTask.isPending || deleteTask.isPending
  }
}