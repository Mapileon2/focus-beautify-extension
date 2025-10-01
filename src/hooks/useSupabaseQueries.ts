import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SessionService } from '@/services/sessionService'
import { TaskService } from '@/services/taskService'
import { QuoteService } from '@/services/quoteService'
import { UserService } from '@/services/userService'
import { ChatService } from '@/services/chatService'
import { useAuth } from './useAuth'

// Session Hooks
export const useSessions = (limit = 50) => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['sessions', user?.id, limit],
    queryFn: () => SessionService.getUserSessions(user!.id, limit),
    enabled: !!user,
  })
}

export const useSessionStats = (dateFrom?: string, dateTo?: string) => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['sessionStats', user?.id, dateFrom, dateTo],
    queryFn: () => SessionService.getSessionStats(user!.id, dateFrom, dateTo),
    enabled: !!user,
  })
}

export const useTodaySessions = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['todaySessions', user?.id],
    queryFn: () => SessionService.getTodaySessions(user!.id),
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export const useCreateSession = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: SessionService.createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['todaySessions', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['sessionStats', user?.id] })
    },
  })
}

export const useCompleteSession = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: SessionService.completeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['todaySessions', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['sessionStats', user?.id] })
    },
  })
}

// Task Hooks
export const useTasks = (completed?: boolean) => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['tasks', user?.id, completed],
    queryFn: () => TaskService.getUserTasks(user!.id, completed),
    enabled: !!user,
  })
}

export const useTasksDueToday = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['tasksDueToday', user?.id],
    queryFn: () => TaskService.getTasksDueToday(user!.id),
    enabled: !!user,
  })
}

export const useOverdueTasks = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['overdueTasks', user?.id],
    queryFn: () => TaskService.getOverdueTasks(user!.id),
    enabled: !!user,
  })
}

export const useCreateTask = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: TaskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['tasksDueToday', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['overdueTasks', user?.id] })
    },
  })
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: any }) =>
      TaskService.updateTask(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['tasksDueToday', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['overdueTasks', user?.id] })
    },
  })
}

export const useToggleTask = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: TaskService.toggleTaskCompletion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['tasksDueToday', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['overdueTasks', user?.id] })
    },
  })
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: TaskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['tasksDueToday', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['overdueTasks', user?.id] })
    },
  })
}

// Quote Hooks
export const useQuotes = (userId?: string, category?: string) => {
  return useQuery({
    queryKey: ['quotes', userId, category],
    queryFn: () => QuoteService.getQuotes(userId, category),
    enabled: !!userId,
  })
}

export const useRandomQuote = (category?: string) => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['randomQuote', user?.id, category],
    queryFn: () => QuoteService.getRandomQuote(user?.id, category),
    staleTime: 0, // Always fetch fresh
  })
}

export const useUserCustomQuotes = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['userCustomQuotes', user?.id],
    queryFn: () => QuoteService.getUserCustomQuotes(user!.id),
    enabled: !!user,
  })
}

export const useCreateQuote = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: QuoteService.createQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['userCustomQuotes', user?.id] })
    },
  })
}

export const useUpdateQuote = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: ({ quoteId, updates }: { quoteId: string; updates: any }) =>
      QuoteService.updateQuote(quoteId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['userCustomQuotes', user?.id] })
    },
  })
}

export const useDeleteQuote = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: QuoteService.deleteQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['userCustomQuotes', user?.id] })
    },
  })
}

// User Profile Hooks
export const useUserProfile = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => UserService.getUserProfile(user!.id),
    enabled: !!user,
  })
}

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: (updates: any) => UserService.updateUserProfile(user!.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] })
    },
  })
}

// User Preferences Hooks
export const useUserPreferences = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['userPreferences', user?.id],
    queryFn: () => UserService.getUserPreferences(user!.id),
    enabled: !!user,
  })
}

export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: (preferences: any) => UserService.updateUserPreferences(user!.id, preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences', user?.id] })
    },
  })
}

// User Statistics Hooks
export const useUserStatistics = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['userStatistics', user?.id],
    queryFn: () => UserService.getUserStatistics(user!.id),
    enabled: !!user,
    refetchInterval: 60000, // Refetch every minute
  })
}

// User Achievements Hooks
export const useUserAchievements = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['userAchievements', user?.id],
    queryFn: () => UserService.getUserAchievements(user!.id),
    enabled: !!user,
  })
}

export const useUnlockAchievement = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: (achievementData: any) => UserService.unlockAchievement(user!.id, achievementData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAchievements', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['userStatistics', user?.id] })
    },
  })
}

// User Goals Hooks
export const useUserGoals = (activeOnly = false) => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['userGoals', user?.id, activeOnly],
    queryFn: () => UserService.getUserGoals(user!.id, activeOnly),
    enabled: !!user,
  })
}

export const useCreateUserGoal = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: UserService.createUserGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGoals', user?.id] })
    },
  })
}

export const useUpdateGoalProgress = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: ({ goalId, currentValue }: { goalId: string; currentValue: number }) =>
      UserService.updateGoalProgress(user!.id, goalId, currentValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGoals', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['userStatistics', user?.id] })
    },
  })
}

// User Activity Log Hooks
export const useUserActivityLog = (limit = 50) => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['userActivityLog', user?.id, limit],
    queryFn: () => UserService.getUserActivityLog(user!.id, limit),
    enabled: !!user,
  })
}

// Chat Hooks
export const useChatConversations = (limit = 20) => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['chatConversations', user?.id, limit],
    queryFn: () => ChatService.getUserConversations(user!.id, limit),
    enabled: !!user,
  })
}

export const useActiveConversation = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['activeConversation', user?.id],
    queryFn: () => ChatService.getOrCreateActiveConversation(user!.id),
    enabled: !!user,
  })
}

export const useConversationMessages = (conversationId?: string) => {
  return useQuery({
    queryKey: ['conversationMessages', conversationId],
    queryFn: () => ChatService.getConversationMessages(conversationId!),
    enabled: !!conversationId,
  })
}

export const useAddChatMessage = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: ChatService.addMessage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversationMessages', data.conversation_id] })
      queryClient.invalidateQueries({ queryKey: ['chatConversations', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['activeConversation', user?.id] })
    },
  })
}

export const useCreateConversation = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: ({ title }: { title?: string }) => ChatService.createConversation(user!.id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatConversations', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['activeConversation', user?.id] })
    },
  })
}

export const useArchiveConversation = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: ChatService.archiveConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatConversations', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['activeConversation', user?.id] })
    },
  })
}

export const useDeleteConversation = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: ChatService.deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatConversations', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['activeConversation', user?.id] })
    },
  })
}

export const useChatStats = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['chatStats', user?.id],
    queryFn: () => ChatService.getConversationStats(user!.id),
    enabled: !!user,
  })
}

// Legacy User Settings Hooks (for backward compatibility)
export const useUserSettings = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['userSettings', user?.id],
    queryFn: () => UserService.getUserSettings(user!.id),
    enabled: !!user,
  })
}

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: (settings: any) => UserService.upsertUserSettings(user!.id, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings', user?.id] })
    },
  })
}