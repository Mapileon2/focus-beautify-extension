import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { AuthService } from '@/services/authService'

export function SimpleSignupTest() {
  const { user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [testResult, setTestResult] = useState('')

  const handleDirectSignup = async () => {
    try {
      setTestResult('Testing direct AuthService signup...')
      
      const result = await AuthService.signUp(email, password, name)
      setTestResult(`Direct signup success: ${JSON.stringify(result, null, 2)}`)
    } catch (error: any) {
      setTestResult(`Direct signup error: ${error.message}`)
      console.error('Direct signup error:', error)
    }
  }

  const handleHookSignup = async () => {
    try {
      setTestResult('Testing hook signup...')
      
      const { signUp } = useAuth()
      const result = await signUp(email, password, name)
      setTestResult(`Hook signup success: ${JSON.stringify(result, null, 2)}`)
    } catch (error: any) {
      setTestResult(`Hook signup error: ${error.message}`)
      console.error('Hook signup error:', error)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Signup Debug Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Current User:</p>
          <pre className="text-xs bg-muted p-2 rounded">
            {user ? JSON.stringify(user, null, 2) : 'No user'}
          </pre>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Loading: {loading ? 'Yes' : 'No'}</p>
        </div>

        <div className="space-y-2">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Button onClick={handleDirectSignup} className="w-full">
            Test Direct AuthService
          </Button>
          <Button onClick={handleHookSignup} variant="outline" className="w-full">
            Test Hook Signup
          </Button>
        </div>

        {testResult && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Test Result:</p>
            <pre className="text-xs bg-muted p-2 rounded max-h-32 overflow-auto">
              {testResult}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}