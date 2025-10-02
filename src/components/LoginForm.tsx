import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/useAuth'
import { AuthService, AuthenticationError, ValidationError } from '@/services/authService'
import { toast } from 'sonner'
import { Mail, AlertCircle } from 'lucide-react'

export const LoginForm: React.FC = () => {
  const { signIn, signUp, resetPassword, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signIn(email, password)
      toast.success('Successfully signed in!')
    } catch (error: any) {
      if (error instanceof AuthenticationError) {
        if (error.code === 'EMAIL_NOT_CONFIRMED') {
          setShowEmailConfirmation(true)
          setPendingEmail(email)
          toast.error('Please confirm your email address before signing in.')
        } else if (error.code === 'INVALID_CREDENTIALS') {
          toast.error('Invalid email or password. Please check your credentials.')
        } else {
          toast.error(error.message)
        }
      } else if (error instanceof ValidationError) {
        toast.error(error.message)
      } else {
        toast.error('An unexpected error occurred. Please try again.')
      }
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signUp(email, password, fullName)
      toast.success('Account created successfully! Please check your email to verify your account.')
    } catch (error: any) {
      if (error instanceof AuthenticationError) {
        toast.error(error.message)
      } else if (error instanceof ValidationError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to create account. Please try again.')
      }
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await resetPassword(resetEmail)
      toast.success(result.message || 'Password reset email sent! Check your inbox.')
    } catch (error: any) {
      if (error instanceof ValidationError) {
        toast.error(error.message)
      } else if (error instanceof AuthenticationError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to send reset email. Please try again.')
      }
    }
  }

  const handleResendConfirmation = async () => {
    try {
      await AuthService.resendConfirmation(pendingEmail)
      toast.success('Confirmation email resent! Check your inbox.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend confirmation email')
    }
  }

  const handleSkipEmailConfirmation = async () => {
    // For development purposes - allow signing in without email confirmation
    try {
      await signIn(pendingEmail, password)
      toast.success('Signed in successfully!')
      setShowEmailConfirmation(false)
    } catch (error: any) {
      toast.error('Please use the correct password or confirm your email first.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.svg" alt="Focus Timer" className="w-12 h-12" />
            <CardTitle>Focus Timer</CardTitle>
          </div>
          <CardDescription>
            Sign in to sync your data across devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showEmailConfirmation && (
            <Alert className="mb-4">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>Please check your email ({pendingEmail}) and click the confirmation link.</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleResendConfirmation}
                    >
                      Resend Email
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSkipEmailConfirmation}
                    >
                      Skip for Development
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="reset">Reset</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email</Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="reset">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}