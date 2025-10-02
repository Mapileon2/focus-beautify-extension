import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthService } from '@/services/authService'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  CheckCircle, 
  AlertTriangle, 
  Mail, 
  Loader2,
  Zap,
  ArrowRight
} from 'lucide-react'

type MagicLinkStatus = 'loading' | 'success' | 'error' | 'expired' | 'invalid'

export function MagicLinkPage() {
  const [status, setStatus] = useState<MagicLinkStatus>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    handleMagicLinkVerification()
  }, [])

  const handleMagicLinkVerification = async () => {
    try {
      // Get parameters from URL
      const token = searchParams.get('token')
      const type = searchParams.get('type')
      const error = searchParams.get('error')
      const errorCode = searchParams.get('error_code')
      const errorDescription = searchParams.get('error_description')

      console.log('Magic link params:', { token, type, error, errorCode, errorDescription })

      // Check for errors in URL
      if (error) {
        console.error('Magic link error:', { error, errorCode, errorDescription })
        
        if (errorCode === 'otp_expired') {
          setStatus('expired')
          setErrorMessage('The magic link has expired. Please request a new one.')
        } else if (errorCode === 'access_denied') {
          setStatus('invalid')
          setErrorMessage('The magic link is invalid or has already been used.')
        } else {
          setStatus('error')
          setErrorMessage(errorDescription || 'Magic link verification failed.')
        }
        return
      }

      // Check for access token (successful magic link)
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')

      if (accessToken && refreshToken) {
        // Set the session with tokens from URL
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })

        if (sessionError) {
          console.error('Session error:', sessionError)
          setStatus('error')
          setErrorMessage('Failed to authenticate with magic link.')
          return
        }

        if (data.session && data.user) {
          setStatus('success')
          toast.success('Successfully signed in with magic link!')
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
          return
        }
      }

      // If no token or access token, check if already authenticated
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setStatus('success')
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
        return
      }

      // No valid authentication found
      setStatus('invalid')
      setErrorMessage('No valid magic link found. Please request a new one.')

    } catch (error: any) {
      console.error('Magic link verification error:', error)
      setStatus('error')
      setErrorMessage('An unexpected error occurred during magic link verification.')
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="text-lg font-semibold mb-2">Verifying Magic Link...</h3>
            <p className="text-muted-foreground">Please wait while we sign you in.</p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2 text-green-700">Successfully Signed In!</h3>
            <p className="text-muted-foreground mb-4">
              You have been authenticated with your magic link. Redirecting to dashboard...
            </p>
            <Button onClick={() => navigate('/dashboard')} className="gap-2">
              Continue to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )

      case 'expired':
        return (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold mb-2 text-yellow-700">Magic Link Expired</h3>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/?tab=magic')} className="gap-2">
                <Zap className="h-4 w-4" />
                Request New Magic Link
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Sign In
              </Button>
            </div>
          </div>
        )

      case 'invalid':
        return (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2 text-red-700">Invalid Magic Link</h3>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/?tab=magic')} className="gap-2">
                <Mail className="h-4 w-4" />
                Request New Magic Link
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Sign In
              </Button>
            </div>
          </div>
        )

      case 'error':
      default:
        return (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2 text-red-700">Authentication Failed</h3>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <div className="space-y-3">
              <Button onClick={handleMagicLinkVerification} variant="outline" className="gap-2">
                <Loader2 className="h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={() => navigate('/')}>
                Back to Sign In
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-12 h-12 text-primary" />
            <CardTitle>Magic Link Authentication</CardTitle>
          </div>
          <CardDescription>
            Passwordless sign in verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
          
          {status !== 'loading' && status !== 'success' && (
            <Alert className="mt-4">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>Need help?</strong> Magic links expire after 5 minutes for security. 
                If you continue to have issues, please try signing in with your password.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}