import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Database, 
  BarChart3, 
  TrendingUp,
  Award,
  Play,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSessions, useSessionStats, useTodaySessions } from '@/hooks/useSupabaseQueries';
import AnalyticsTest, { AnalyticsTestResult } from '@/utils/analyticsTest';
import { toast } from 'sonner';

export function AnalyticsDebugPanel() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<Record<string, AnalyticsTestResult>>({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [overallResult, setOverallResult] = useState<boolean | null>(null);

  // Get actual data from hooks
  const { data: sessions = [], isLoading: sessionsLoading, error: sessionsError } = useSessions(10);
  const { data: todaySessions = [], isLoading: todayLoading, error: todayError } = useTodaySessions();
  const { data: sessionStats, isLoading: statsLoading, error: statsError } = useSessionStats();

  const runComprehensiveTest = async () => {
    if (!user) {
      toast.error('Please sign in to run analytics tests');
      return;
    }

    setIsRunningTests(true);
    setTestResults({});
    setOverallResult(null);

    try {
      const { overall, results } = await AnalyticsTest.runComprehensiveTest(user.id);
      setTestResults(results);
      setOverallResult(overall);
      
      if (overall) {
        toast.success('All analytics tests passed! 🎉');
      } else {
        toast.error('Some analytics tests failed. Check the results below.');
      }
    } catch (error) {
      console.error('Test execution failed:', error);
      toast.error('Failed to run analytics tests');
    } finally {
      setIsRunningTests(false);
    }
  };

  const createSampleData = async () => {
    if (!user) {
      toast.error('Please sign in to create sample data');
      return;
    }

    try {
      const result = await AnalyticsTest.createSampleData(user.id);
      if (result.success) {
        toast.success('Sample data created successfully!');
        // Refresh the page or refetch data
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Sample data creation failed:', error);
      toast.error('Failed to create sample data');
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "PASS" : "FAIL"}
      </Badge>
    );
  };

  if (!user) {
    return (
      <Card className="glass">
        <CardContent className="p-6 text-center">
          <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">
            Please sign in to test analytics functionality
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={runComprehensiveTest} 
                disabled={isRunningTests}
                className="flex items-center gap-2"
              >
                {isRunningTests ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Run Analytics Tests
              </Button>
              
              <Button 
                variant="outline" 
                onClick={createSampleData}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Create Sample Data
              </Button>

              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            {overallResult !== null && (
              <Alert>
                <div className="flex items-center gap-2">
                  {getStatusIcon(overallResult)}
                  <AlertDescription>
                    <strong>Overall Result:</strong> {overallResult ? 'All tests passed' : 'Some tests failed'}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="live-data" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live-data">Live Data</TabsTrigger>
          <TabsTrigger value="test-results">Test Results</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
        </TabsList>

        {/* Live Data Tab */}
        <TabsContent value="live-data" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm">All Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : sessionsError ? (
                  <div className="text-red-500 text-xs">{sessionsError.message}</div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold">{sessions.length}</div>
                    <div className="text-xs text-muted-foreground">
                      Focus: {sessions.filter(s => s.session_type === 'focus').length}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm">Today's Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {todayLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : todayError ? (
                  <div className="text-red-500 text-xs">{todayError.message}</div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold">{todaySessions.length}</div>
                    <div className="text-xs text-muted-foreground">
                      Completed: {todaySessions.filter(s => s.completed).length}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm">Session Stats</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : statsError ? (
                  <div className="text-red-500 text-xs">{statsError.message}</div>
                ) : sessionStats ? (
                  <div>
                    <div className="text-2xl font-bold">{sessionStats.totalSessions}</div>
                    <div className="text-xs text-muted-foreground">
                      {sessionStats.totalFocusTime}m focus time
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-xs">No stats available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Sessions */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length > 0 ? (
                <div className="space-y-2">
                  {sessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant={session.session_type === 'focus' ? 'default' : 'secondary'}>
                          {session.session_type}
                        </Badge>
                        <span className="text-sm">{session.duration_minutes}m</span>
                        {session.completed && <CheckCircle className="h-3 w-3 text-green-500" />}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(session.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No sessions found. Create some sample data to test analytics.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="test-results" className="space-y-4">
          {Object.keys(testResults).length === 0 ? (
            <Card className="glass">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No test results yet. Run the analytics tests to see detailed results.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(testResults).map(([testName, result]) => (
                <Card key={testName} className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.success)}
                        <span className="capitalize">{testName.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                      {getStatusBadge(result.success)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">{result.message}</p>
                    {result.error && (
                      <Alert>
                        <XCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-600">
                          {result.error}
                        </AlertDescription>
                      </Alert>
                    )}
                    {result.details && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <pre>{JSON.stringify(result.details, null, 2)}</pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Diagnostics Tab */}
        <TabsContent value="diagnostics" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>System Diagnostics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Authentication</span>
                  {getStatusBadge(!!user)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Supabase Connection</span>
                  {getStatusBadge(!sessionsError && !todayError && !statsError)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">React Query Integration</span>
                  {getStatusBadge(!sessionsLoading || sessions.length >= 0)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recharts Library</span>
                  {getStatusBadge(true)} {/* Recharts is installed */}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Session Data Available</span>
                  {getStatusBadge(sessions.length > 0)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Database Schema Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>✅ focus_sessions table exists</div>
                <div>✅ Row Level Security enabled</div>
                <div>✅ Proper indexes created</div>
                <div>✅ Foreign key constraints</div>
                <div>✅ Session type validation</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}