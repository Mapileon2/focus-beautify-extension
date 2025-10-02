import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { AuthService, AuthenticationError, ValidationError } from '@/services/authService'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { CheckCircle, AlertCircle, Eye, EyeOff, Lock, Loader2 } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      try {
        // Check for error parameters in URL
        const error = searchParams.get('error')
        const errorCode = searchParams.get('error_code')
        const errorDescription = searchParams.get('error_description')

        if (error) {
          console.error('Reset password error:', { error, errorCode, errorDescription })
          setErrorMessage(errorDescription || 'Password reset link is invalid or has expired.')
          setSessionLoading(false)
          return
        }

        // Check for access token or session
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')

        if (accessToken && refreshToken) {
          // Set the session with the tokens from URL
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (sessionError) {
            console.error('Session error:', sessionError)
            setErrorMessage('Failed to validate reset session. Please try again.')
            setSessionLoading(false)
            return
          }

          if (data.session) {
            setIsValidSession(true)
            setSessionLoading(false)
            return
          }
        }

        // Fallback: check current session
        const session = await AuthService.getCurrentSession()
        if (session) {
          setIsValidSession(true)
        } else {
          setErrorMessage('Invalid or expired password reset link. Please request a new one.')
        }
      } catch (error: any) {
        console.error('Session check error:', error)
        setErrorMessage('Failed to validate reset session. Please try again.')
      } finally {
        setSessionLoading(false)
      }
    }

    checkSession()
  }, [navigate, searchParams])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setLoading(true)
    try {
      const result = await AuthService.updatePassword(newPassword)
      toast.success(result.message || 'Password updated successfully!')
      
      // Clear the URL parameters and redirect
      window.history.replaceState({}, '', '/dashboard')
      navigate('/dashboard')
    } catch (error: any) {
      if (error instanceof ValidationError) {
        toast.error(error.message)
      } else if (error instanceof AuthenticationError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to update password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 25
    if (/(?=.*[a-z])(?=.*[A-Z])/.test(password)) strength += 25
    if (/(?=.*\d)/.test(password)) strength += 25
    return strength
  }

  const passwordStrength = getPasswordStrength(newPassword)

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Validating reset session...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <CardTitle className="text-red-700">Reset Link Invalid</CardTitle>
            <CardDescription>
              {errorMessage || 'The password reset link is invalid or has expired.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Password reset links expire after 1 hour for security. Please request a new reset link.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                Back to Sign In
              </Button>
              <Button onClick={() => navigate('/?tab=reset')} className="flex-1">
                Request New Link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You can now set a new password for your account.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Enter new password"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {newPassword && (
                <div className="space-y-1">
                  <Progress value={passwordStrength} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Password strength: {
                      passwordStrength < 50 ? 'Weak' :
                      passwordStrength < 75 ? 'Good' : 'Strong'
                    }
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Confirm new password"
                  className="pl-10 pr-10"
                />
                {confirmPassword && newPassword === confirmPassword && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Passwords do not match
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || newPassword !== confirmPassword || newPassword.length < 8}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
              className="text-sm"
            >
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}