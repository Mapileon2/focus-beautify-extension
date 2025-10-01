import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { IntegrationTester, TestResult } from '@/utils/integrationTest'
import { StorageTester, StorageTestResult } from '@/utils/storageTest'
import { DatabaseSetup } from '@/utils/databaseSetup'
import { DatabaseSetupGuide } from './DatabaseSetupGuide'
import { UserProfileCreator } from './UserProfileCreator'
import { useAuth } from '@/hooks/useAuth'
import { LoginForm } from './LoginForm'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

export const SupabaseStatus: React.FC = () => {
  const { user, loading } = useAuth()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [storageResults, setStorageResults] = useState<StorageTestResult[]>([])
  const [testing, setTesting] = useState(false)
  const [summary, setSummary] = useState({ total: 0, success: 0, errors: 0, warnings: 0, successRate: 0 })
  const [storageSummary, setStorageSummary] = useState({ total: 0, success: 0, errors: 0, warnings: 0, successRate: 0, isHealthy: false })
  const [needsSetup, setNeedsSetup] = useState(false)
  const [needsProfile, setNeedsProfile] = useState(false)

  const runComprehensiveTests = async () => {
    setTesting(true)
    try {
      // Run integration tests
      const tester = new IntegrationTester()
      const results = await tester.runAllTests()
      
      // If user is authenticated, run user-specific tests
      if (user) {
        await tester.testUserOperations(user.id)
      }
      
      const finalResults = tester.getResults()
      const testSummary = tester.getSummary()
      
      setTestResults(finalResults)
      setSummary(testSummary)

      // Run storage tests
      const storageTester = new StorageTester()
      const storageTestResults = await storageTester.runStorageTests()
      const storageTestSummary = storageTester.getSummary()
      
      setStorageResults(storageTestResults)
      setStorageSummary(storageTestSummary)

      // Check if database setup is needed
      const setupChecker = new DatabaseSetup()
      const setupResults = await setupChecker.verifyDatabaseSetup()
      const setupSummary = setupChecker.getSummary()
      setNeedsSetup(setupSummary.needsSetup)

      // Check if user profile creation is needed
      const profileWarnings = setupResults.filter(r => 
        r.step.includes('User Profile') || r.step.includes('User Settings')
      ).filter(r => r.status === 'warning')
      
      setNeedsProfile(profileWarnings.length > 0 && !setupSummary.needsSetup)
      
    } catch (error) {
      console.error('Comprehensive test failed:', error)
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    runComprehensiveTests()
  }, [user])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading authentication...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access the full backend status and user-specific features
            </CardDescription>
          </CardHeader>
        </Card>
        <LoginForm />
      </div>
    )
  }

  // Show database setup guide if tables are missing
  if (needsSetup) {
    return <DatabaseSetupGuide />
  }

  // Show profile creator if user profile/settings are missing
  if (needsProfile) {
    return (
      <div className="space-y-4">
        <UserProfileCreator />
        <Button 
          onClick={runComprehensiveTests} 
          disabled={testing} 
          variant="outline"
          className="w-full"
        >
          {testing ? 'Checking...' : 'Refresh Status'}
        </Button>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      case 'warning':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Backend Integration Status</CardTitle>
          <CardDescription>
            Comprehensive test results for Supabase backend integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.success}</div>
              <div className="text-sm text-muted-foreground">Success</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.errors}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{summary.successRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Health</span>
              <span>{summary.successRate}%</span>
            </div>
            <Progress value={summary.successRate} className="h-2" />
          </div>
          
          <Button onClick={runComprehensiveTests} disabled={testing} className="w-full">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run Full Integration Test'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Storage Backend Status */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Backend Status</CardTitle>
          <CardDescription>
            Database connection, tables, and data operations status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${storageSummary.isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                {storageSummary.isHealthy ? '✅' : '❌'}
              </div>
              <div className="text-sm text-muted-foreground">Storage Health</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{storageSummary.success}</div>
              <div className="text-sm text-muted-foreground">Success</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{storageSummary.errors}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{storageSummary.successRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage Health</span>
              <span>{storageSummary.successRate}%</span>
            </div>
            <Progress value={storageSummary.successRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Storage Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Test Results</CardTitle>
          <CardDescription>
            Detailed storage backend connection and operation tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {storageResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{result.test}</div>
                    <div className="text-sm text-muted-foreground">{result.message}</div>
                  </div>
                </div>
                <Badge variant={getStatusVariant(result.status)}>
                  {result.status}
                </Badge>
              </div>
            ))}
            
            {storageResults.length === 0 && !testing && (
              <div className="text-center py-8 text-muted-foreground">
                No storage test results yet. Click "Run Full Integration Test" to start.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Integration Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Test Results</CardTitle>
          <CardDescription>
            General integration and service layer tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground">{result.message}</div>
                  </div>
                </div>
                <Badge variant={getStatusVariant(result.status)}>
                  {result.status}
                </Badge>
              </div>
            ))}
            
            {testResults.length === 0 && !testing && (
              <div className="text-center py-8 text-muted-foreground">
                No integration test results yet. Click "Run Full Integration Test" to start.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle>Authenticated User</CardTitle>
          <CardDescription>
            Current user session information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="font-mono text-sm">{user.email}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">User ID</label>
              <div className="font-mono text-sm truncate">{user.id}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <div className="text-sm">{new Date(user.created_at).toLocaleString()}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Sign In</label>
              <div className="text-sm">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}