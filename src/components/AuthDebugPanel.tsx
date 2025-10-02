import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/useAuth'
import { runAuthDebugTests } from '@/utils/authDebugTest'
import { 
  User, 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  Play,
  Loader2,
  RefreshCw
} from 'lucide-react'

export function AuthDebugPanel() {
  const { user, session, loading } = useAuth()
  const [debugResults, setDebugResults] = useState<any>(null)
  const [isRunningTests, setIsRunningTests] = useState(false)

  const handleRunTests = async () => {
    setIsRunningTests(true)
    try {
      const results = await runAuthDebugTests()
      setDebugResults(results)
    } catch (error) {
      console.error('Debug tests failed:', error)
    } finally {
      setIsRunningTests(false)
    }
  }

  const getStatusColor = (status: boolean | null) => {
    if (status === null) return 'bg-gray-500'
    return status ? 'bg-green-500' : 'bg-red-500'
  }

  const getStatusText = (status: boolean | null) => {
    if (status === null) return 'Unknown'
    return status ? 'Pass' : 'Fail'
  }

  return (
    <div className="space-y-6">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Authentication Debug Panel
          </CardTitle>
          <CardDescription>
            Debug authentication issues and verify system status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Auth State */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Authentication State</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(!!user)}`} />
                  <div>
                    <h4 className="font-medium">User Status</h4>
                    <p className="text-sm text-muted-foreground">
                      {user ? `Signed in as ${user.email}` : 'Not signed in'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(!!session)}`} />
                  <div>
                    <h4 className="font-medium">Session Status</h4>
                    <p className="text-sm text-muted-foreground">
                      {session ? 'Active session' : 'No active session'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(!loading)}`} />
                  <div>
                    <h4 className="font-medium">Loading State</h4>
                    <p className="text-sm text-muted-foreground">
                      {loading ? 'Loading...' : 'Ready'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(user?.email_confirmed_at ? true : false)}`} />
                  <div>
                    <h4 className="font-medium">Email Confirmation</h4>
                    <p className="text-sm text-muted-foreground">
                      {user?.email_confirmed_at ? 'Confirmed' : 'Not confirmed'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {user && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>User Details:</strong>
                  <br />
                  ID: {user.id}
                  <br />
                  Email: {user.email}
                  <br />
                  Created: {new Date(user.created_at).toLocaleString()}
                  <br />
                  Last Sign In: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Debug Tests */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">System Debug Tests</h3>
              <Button 
                onClick={handleRunTests} 
                disabled={isRunningTests}
                className="gap-2"
              >
                {isRunningTests ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Tests
                  </>
                )}
              </Button>
            </div>

            {debugResults && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(debugResults.connectivity)}`} />
                    <div>
                      <h4 className="font-medium">Connectivity</h4>
                      <p className="text-sm text-muted-foreground">
                        Supabase connection test
                      </p>
                    </div>
                    <Badge variant={debugResults.connectivity ? "secondary" : "destructive"}>
                      {getStatusText(debugResults.connectivity)}
                    </Badge>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(debugResults.userCreation)}`} />
                    <div>
                      <h4 className="font-medium">User Creation</h4>
                      <p className="text-sm text-muted-foreground">
                        Signup flow test
                      </p>
                    </div>
                    <Badge variant={debugResults.userCreation ? "secondary" : "destructive"}>
                      {getStatusText(debugResults.userCreation)}
                    </Badge>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(debugResults.authState)}`} />
                    <div>
                      <h4 className="font-medium">Auth State</h4>
                      <p className="text-sm text-muted-foreground">
                        Authentication state test
                      </p>
                    </div>
                    <Badge variant={debugResults.authState ? "secondary" : "destructive"}>
                      {getStatusText(debugResults.authState)}
                    </Badge>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(debugResults.databaseSchema)}`} />
                    <div>
                      <h4 className="font-medium">Database Schema</h4>
                      <p className="text-sm text-muted-foreground">
                        Database tables test
                      </p>
                    </div>
                    <Badge variant={debugResults.databaseSchema ? "secondary" : "destructive"}>
                      {getStatusText(debugResults.databaseSchema)}
                    </Badge>
                  </div>
                </Card>
              </div>
            )}

            {!debugResults && (
              <Card className="p-8 text-center">
                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Ready to Debug</h3>
                <p className="text-muted-foreground mb-4">
                  Run comprehensive tests to identify authentication issues
                </p>
                <Button onClick={handleRunTests} disabled={isRunningTests}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Debug Tests
                </Button>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
              <Button 
                variant="outline" 
                onClick={() => console.clear()}
                className="gap-2"
              >
                Clear Console
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}