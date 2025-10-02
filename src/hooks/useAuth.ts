import { useState, useEffect, useContext, createContext } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { AuthService } from '@/services/authService'
import { UserService } from '@/services/userService'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        const session = await AuthService.getCurrentSession()
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session)
        
        if (!mounted) return

        try {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)

          // Create user profile if it's a new signup
          if (event === 'SIGNED_UP' && session?.user) {
            try {
              await UserService.createUserProfile({
                id: session.user.id,
                email: session.user.email!,
                full_name: session.user.user_metadata?.full_name || null,
                avatar_url: session.user.user_metadata?.avatar_url || null,
              })
            } catch (error) {
              console.error('Error creating user profile:', error)
            }
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error)
          if (mounted) {
            setLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true)
    try {
      console.log('Starting signup process...')
      const result = await AuthService.signUp(email, password, fullName)
      console.log('Signup result:', result)
      
      // Set loading to false after a short delay to allow auth state to update
      setTimeout(() => setLoading(false), 1000)
      
      return result
    } catch (error) {
      console.error('Signup error in hook:', error)
      setLoading(false)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await AuthService.signIn(email, password)
      // Don't set loading to false here - let the auth state change handle it
      return result
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await AuthService.signOut()
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    return await AuthService.resetPassword(email)
  }

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    await AuthService.updateProfile(updates)
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  }
}