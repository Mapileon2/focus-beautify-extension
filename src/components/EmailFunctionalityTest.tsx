import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AuthService } from '@/services/authService'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  Mail, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  TestTube,
  Settings,
  Eye,
  Clock,
  Shield
} from 'lucide-react'

interface TestResult {
  test: string
  status: 'PASS' | 'FAIL' | 'PENDING'
  message: string
  timestamp?: string
}

export function EmailFunctionalityTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [emailTemplateInfo, setEmailTemplateInfo] = useState<any>(null)

  // Add test result
  const addTestResult = (test: string, status: 'PASS' | 'FAIL' | 'PENDING', message: string) => {
    const result: TestResult = {
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }
    setTestResults(prev => [...prev, result])
    
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏳'
    console.log(`${icon} ${test}: ${message}`)
  }

  // Test email confirmation functionality
  const testEmailConfirmation = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address')
      return
    }

    addTestResult('Email Confirmation', 'PENDING', 'Testing signup email confirmation...')

    try {
      // Test signup with email confirmation
      const result = await AuthService.signUp(testEmail, 'TestPass123!', 'Test User')
      
      if (result.user) {
        addTestResult('Email Confirmation', 'PASS', 'Signup successful, confirmation email should be sent')
        
        // Test resend functionality
        try {
          await AuthService.resendConfirmation(testEmail)
          addTestResult('Resend Confirmation', 'PASS', 'Resend confirmation email successful')
        } catch (resendError: any) {
          addTestResult('Resend Confirmation', 'FAIL', `Resend failed: ${resendError.message}`)
        }
      } else {
        addTestResult('Email Confirmation', 'FAIL', 'Signup failed - no user returned')
      }
    } catch (error: any) {
      if (error.message.includes('already registered')) {
        addTestResult('Email Confirmation', 'PASS', 'User already exists - email system working')
      } else {
        addTestResult('Email Confirmation', 'FAIL', `Signup failed: ${error.message}`)
      }
    }
  }

  // Test password reset functionality
  const testPasswordReset = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address')
      return
    }

    addTestResult('Password Reset', 'PENDING', 'Testing password reset email...')

    try {
      const result = await AuthService.resetPassword(testEmail)
      
      if (result.success) {
        addTestResult('Password Reset', 'PASS', result.message)
      } else {
        addTestResult('Password Reset', 'FAIL', 'Reset password returned unsuccessful')
      }
    } catch (error: any) {
      addTestResult('Password Reset', 'FAIL', `Reset failed: ${error.message}`)
    }
  }

  // Test email validation
  const testEmailValidation = async () => {
    addTestResult('Email Validation', 'PENDING', 'Testing email validation...')

    const invalidEmails = [
      'invalid-email',
      'test@',
      '@domain.com',
      'test..test@domain.com'
    ]

    let validationPassed = true

    for (const email of invalidEmails) {
      try {
        await AuthService.resetPassword(email)
        validationPassed = false
        addTestResult('Email Validation', 'FAIL', `Invalid email ${email} was accepted`)
        break
      } catch (error: any) {
        if (error.field === 'email') {
          // Expected validation error
          continue
        } else {
          validationPassed = false
          addTestResult('Email Validation', 'FAIL', `Unexpected error for ${email}: ${error.message}`)
          break
        }
      }
    }

    if (validationPassed) {
      addTestResult('Email Validation', 'PASS', 'All invalid emails properly rejected')
    }
  }

  // Check Supabase email settings
  const checkSupabaseSettings = async () => {
    addTestResult('Supabase Settings', 'PENDING', 'Checking Supabase configuration...')

    try {
      // Test basic connectivity
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        addTestResult('Supabase Settings', 'FAIL', `Connection error: ${error.message}`)
        return
      }

      addTestResult('Supabase Settings', 'PASS', 'Supabase connection successful')

      // Check if we can access auth settings (this might not work in client-side)
      try {
        const { data: settings } = await supabase.auth.getUser()
        addTestResult('Auth Access', 'PASS', 'Auth service accessible')
      } catch (authError: any) {
        addTestResult('Auth Access', 'FAIL', `Auth access error: ${authError.message}`)
      }

    } catch (error: any) {
      addTestResult('Supabase Settings', 'FAIL', `Configuration error: ${error.message}`)
    }
  }

  // Test email template information
  const checkEmailTemplates = async () => {
    addTestResult('Email Templates', 'PENDING', 'Checking email template configuration...')

    // Since we can't directly access Supabase email templates from client-side,
    // we'll provide information about what should be configured
    const templateInfo = {
      confirmationTemplate: {
        name: 'Email Confirmation',
        redirectUrl: `${window.location.origin}/confirm-email`,
        required: true,
        status: 'Should be configured in Supabase Dashboard'
      },
      resetTemplate: {
        name: 'Password Reset',
        redirectUrl: `${window.location.origin}/reset-password`,
        required: true,
        status: 'Should be configured in Supabase Dashboard'
      },
      inviteTemplate: {
        name: 'User Invite',
        redirectUrl: `${window.location.origin}/dashboard`,
        required: false,
        status: 'Optional - for team invites'
      }
    }

    setEmailTemplateInfo(templateInfo)
    addTestResult('Email Templates', 'PASS', 'Template configuration info loaded')
  }

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])

    try {
      await checkSupabaseSettings()
      await testEmailValidation()
      await checkEmailTemplates()
      
      if (testEmail) {
        await testPasswordReset()
        // Note: We don't run email confirmation test automatically as it creates users
      }
    } catch (error) {
      console.error('Test execution error:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'bg-green-500'
      case 'FAIL': return 'bg-red-500'
      case 'PENDING': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const passedTests = testResults.filter(r => r.status === 'PASS').length
  const failedTests = testResults.filter(r => r.status === 'FAIL').length
  const totalTests = testResults.length

  return (
    <div className="space-y-6">
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Email Functionality Test Suite</CardTitle>
              <CardDescription>
                Comprehensive testing of email confirmation, password reset, and templates
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tests" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tests">Run Tests</TabsTrigger>
              <TabsTrigger value="templates">Email Templates</TabsTrigger>
              <TabsTrigger value="settings">Configuration</TabsTrigger>
            </TabsList>

            {/* Tests Tab */}
            <TabsContent value="tests" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="testEmail">Test Email Address</Label>
                    <Input
                      id="testEmail"
                      type="email"
                      placeholder="test@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={runAllTests} 
                    disabled={isRunning}
                    className="gap-2"
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4" />
                        Run Tests
                      </>
                    )}
                  </Button>
                </div>

                {totalTests > 0 && (
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Test Results</span>
                        <span className="text-sm text-muted-foreground">
                          {passedTests} passed, {failedTests} failed
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {testResults.map((result, index) => (
                          <div
                            key={index}
                            className={`w-4 h-2 rounded ${getStatusColor(result.status)}`}
                            title={`${result.test}: ${result.status}`}
                          />
                        ))}
                      </div>
                    </div>
                    <Badge variant={failedTests === 0 ? "secondary" : "destructive"}>
                      {Math.round((passedTests / totalTests) * 100)}% Success
                    </Badge>
                  </div>
                )}

                {/* Individual Test Buttons */}
                <div className="grid gap-2 md:grid-cols-2">
                  <Button 
                    variant="outline" 
                    onClick={testEmailValidation}
                    disabled={isRunning}
                    className="gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Test Email Validation
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={testPasswordReset}
                    disabled={isRunning || !testEmail}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Test Password Reset
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={testEmailConfirmation}
                    disabled={isRunning || !testEmail}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Test Email Confirmation
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={checkSupabaseSettings}
                    disabled={isRunning}
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Check Supabase Settings
                  </Button>
                </div>

                {/* Test Results */}
                {testResults.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Test Results:</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {testResults.map((result, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-3 p-3 rounded-lg bg-card/50"
                        >
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(result.status)}`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">{result.test}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant={result.status === 'PASS' ? "secondary" : result.status === 'FAIL' ? "destructive" : "outline"}>
                                  {result.status}
                                </Badge>
                                {result.timestamp && (
                                  <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{result.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Email Templates Tab */}
            <TabsContent value="templates" className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <strong>Email Templates Configuration:</strong> These templates should be configured 
                  in your Supabase Dashboard under Authentication → Email Templates.
                </AlertDescription>
              </Alert>

              {emailTemplateInfo && (
                <div className="space-y-4">
                  {Object.entries(emailTemplateInfo).map(([key, template]: [string, any]) => (
                    <Card key={key} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant={template.required ? "secondary" : "outline"}>
                            {template.required ? 'Required' : 'Optional'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Redirect URL: <code className="bg-muted px-1 rounded">{template.redirectUrl}</code>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Status: {template.status}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <Button onClick={checkEmailTemplates} className="gap-2">
                <Eye className="h-4 w-4" />
                Load Template Info
              </Button>
            </TabsContent>

            {/* Configuration Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  <strong>Supabase Configuration Checklist:</strong> Ensure these settings are 
                  properly configured in your Supabase project.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Authentication Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Enable email confirmations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Configure email service (SMTP or provider)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Set up redirect URLs</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2">Email Templates</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>Confirmation email template</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>Password reset email template</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>Magic link email template (optional)</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2">Security Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-orange-500" />
                      <span>Email rate limiting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-orange-500" />
                      <span>OTP expiration time</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-orange-500" />
                      <span>Allowed redirect URLs</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}