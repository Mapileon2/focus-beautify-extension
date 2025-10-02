import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  CheckCircle, 
  AlertTriangle, 
  Mail, 
  Loader2,
  ArrowRight,
  RefreshCw
} from 'lucide-react'

type EmailChangeStatus = 'loading' | 'success' | 'error' | 'expired' | 'invalid'

export function ChangeEmailPage() {
  const [status, setStatus] = useState<EmailChangeStatus>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    handleEmailChangeConfirmation()
  }, [])

  const handleEmailChangeConfirmation = async () => {
    try {
      // Get parameters from URL
      const token = searchParams.get('token')
      const type = searchParams.get('type')
      const error = searchParams.get('error')
      const errorCode = searchParams.get('error_code')
      const errorDescription = searchParams.get('error_description')

      console.log('Email change params:', { token, type, error, errorCode, errorDescription })

      // Check for errors in URL
      if (error) {
        console.error('Email change error:', { error, errorCode, errorDescription })
        
        if (errorCode === 'otp_expired') {
          setStatus('expired')
          setErrorMessage('The email change link has expired. Please request a new one.')
        } else if (errorCode === 'access_denied') {
          setStatus('invalid')
          setErrorMessage('The email change link is invalid or has already been used.')
        } else {
          setStatus('error')
          setErrorMessage(errorDescription || 'Email change verification failed.')
        }
        return
      }

      // Check for access token (successful email change)
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
          setErrorMessage('Failed to confirm email change.')
          return
        }

        if (data.session && data.user) {
          setStatus('success')
          setNewEmail(data.user.email || '')
          toast.success('Email address changed successfully!')
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard')
          }, 3000)
          return
        }
      }

      // If no token, check current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // User is already authenticated, might be accessing directly
        setStatus('success')
        setNewEmail(user.email || '')
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
        return
      }

      // No valid authentication found
      setStatus('invalid')
      setErrorMessage('No valid email change confirmation found.')

    } catch (error: any) {
      console.error('Email change confirmation error:', error)
      setStatus('error')
      setErrorMessage('An unexpected error occurred during email change confirmation.')
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="text-lg font-semibold mb-2">Confirming Email Change...</h3>
            <p className="text-muted-foreground">Please wait while we update your email address.</p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2 text-green-700">Email Changed Successfully!</h3>
            <p className="text-muted-foreground mb-4">
              Your email address has been updated to: <strong>{newEmail}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              You can now use your new email address to sign in.
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
            <h3 className="text-lg font-semibold mb-2 text-yellow-700">Link Expired</h3>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/settings')} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Go to Settings to Change Email
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        )

      case 'invalid':
        return (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2 text-red-700">Invalid Link</h3>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/settings')} className="gap-2">
                <Mail className="h-4 w-4" />
                Go to Settings
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        )

      case 'error':
      default:
        return (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2 text-red-700">Confirmation Failed</h3>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <div className="space-y-3">
              <Button onClick={handleEmailChangeConfirmation} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
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
            <Mail className="w-12 h-12 text-primary" />
            <CardTitle>Email Change Confirmation</CardTitle>
          </div>
          <CardDescription>
            Confirming your new email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
          
          {status !== 'loading' && status !== 'success' && (
            <Alert className="mt-4">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>Need help?</strong> Email change links expire after 24 hours for security. 
                You can request a new email change from your account settings.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}