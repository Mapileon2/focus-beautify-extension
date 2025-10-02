import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'
import { AuthService } from '@/services/authService'
import { toast } from 'sonner'
import { 
  CheckCircle, 
  AlertTriangle, 
  Mail, 
  Loader2,
  RefreshCw,
  ArrowRight
} from 'lucide-react'

type ConfirmationStatus = 'loading' | 'success' | 'error' | 'expired' | 'invalid'

export function EmailConfirmationPage() {
  const [status, setStatus] = useState<ConfirmationStatus>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    handleEmailConfirmation()
  }, [])

  const handleEmailConfirmation = async () => {
    try {
      // Get the token and type from URL parameters
      const token = searchParams.get('token')
      const type = searchParams.get('type')
      const error = searchParams.get('error')
      const errorCode = searchParams.get('error_code')
      const errorDescription = searchParams.get('error_description')

      console.log('Email confirmation params:', { token, type, error, errorCode, errorDescription })

      // Check if there's an error in the URL
      if (error) {
        console.error('Email confirmation error:', { error, errorCode, errorDescription })
        
        if (errorCode === 'otp_expired') {
          setStatus('expired')
          setErrorMessage('The email confirmation link has expired. Please request a new one.')
        } else if (errorCode === 'access_denied') {
          setStatus('invalid')
          setErrorMessage('The email confirmation link is invalid or has already been used.')
        } else {
          setStatus('error')
          setErrorMessage(errorDescription || 'Email confirmation failed. Please try again.')
        }
        return
      }

      // If no token, check if user is already confirmed
      if (!token) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email_confirmed_at) {
          setStatus('success')
          setUserEmail(user.email || '')
          return
        } else {
          setStatus('invalid')
          setErrorMessage('No confirmation token found. Please check your email for the confirmation link.')
          return
        }
      }

      // Verify the email confirmation token
      const { data, error: confirmError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      })

      if (confirmError) {
        console.error('Email verification error:', confirmError)
        
        if (confirmError.message.includes('expired')) {
          setStatus('expired')
          setErrorMessage('The email confirmation link has expired. Please request a new one.')
        } else if (confirmError.message.includes('invalid')) {
          setStatus('invalid')
          setErrorMessage('The email confirmation link is invalid or has already been used.')
        } else {
          setStatus('error')
          setErrorMessage(confirmError.message || 'Email confirmation failed. Please try again.')
        }
        return
      }

      if (data.user) {
        setStatus('success')
        setUserEmail(data.user.email || '')
        toast.success('Email confirmed successfully! You can now sign in.')
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        setStatus('error')
        setErrorMessage('Email confirmation failed. Please try again.')
      }

    } catch (error: any) {
      console.error('Email confirmation error:', error)
      setStatus('error')
      setErrorMessage(error.message || 'An unexpected error occurred during email confirmation.')
    }
  }

  const handleResendConfirmation = async () => {
    if (!userEmail) {
      toast.error('Please enter your email address to resend confirmation.')
      return
    }

    try {
      await AuthService.resendConfirmation(userEmail)
      toast.success('Confirmation email sent! Please check your inbox.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend confirmation email.')
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="text-lg font-semibold mb-2">Confirming your email...</h3>
            <p className="text-muted-foreground">Please wait while we verify your email address.</p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2 text-green-700">Email Confirmed Successfully!</h3>
            <p className="text-muted-foreground mb-4">
              Your email address {userEmail} has been confirmed. You can now access all features.
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
              <input
                type="email"
                placeholder="Enter your email address"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
              />
              <Button onClick={handleResendConfirmation} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Resend Confirmation Email
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
              <input
                type="email"
                placeholder="Enter your email address"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
              />
              <Button onClick={handleResendConfirmation} className="gap-2">
                <Mail className="h-4 w-4" />
                Request New Confirmation Email
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
              <Button onClick={handleEmailConfirmation} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={() => navigate('/')} className="gap-2">
                Back to Home
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
            <CardTitle>Email Confirmation</CardTitle>
          </div>
          <CardDescription>
            Verifying your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
          
          {status !== 'loading' && status !== 'success' && (
            <Alert className="mt-4">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>Need help?</strong> If you continue to have issues, please contact support 
                or try signing up again with a different email address.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}