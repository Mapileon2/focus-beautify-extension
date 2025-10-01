import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { QuoteService } from '@/services/quoteService';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Bug, Database, User, CheckCircle, XCircle } from 'lucide-react';

export function QuoteDebugPanel() {
  const { user } = useAuth();
  const [debugResults, setDebugResults] = useState<any[]>([]);
  const [testQuote, setTestQuote] = useState({
    content: 'Test quote for debugging',
    author: 'Debug Tester',
    category: 'Debug'
  });

  const addDebugResult = (test: string, status: 'success' | 'error', message: string, data?: any) => {
    setDebugResults(prev => [...prev, {
      test,
      status,
      message,
      data,
      timestamp: new Date().toISOString()
    }]);
  };

  const clearResults = () => {
    setDebugResults([]);
  };

  const runFullDebugTest = async () => {
    clearResults();
    addDebugResult('Debug Test', 'success', 'Starting comprehensive quote debug test...');

    try {
      // 1. Check authentication
      addDebugResult('Authentication', user ? 'success' : 'error', 
        user ? `User authenticated: ${user.email}` : 'User not authenticated',
        user ? { id: user.id, email: user.email } : null
      );

      if (!user) {
        addDebugResult('Test Aborted', 'error', 'Cannot continue without authentication');
        return;
      }

      // 2. Test database connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('quotes')
        .select('count')
        .limit(1);

      addDebugResult('Database Connection', connectionError ? 'error' : 'success',
        connectionError ? `Connection failed: ${connectionError.message}` : 'Database connection successful',
        { connectionTest, connectionError }
      );

      // 3. Test RLS policies - SELECT
      const { data: selectTest, error: selectError } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)
        .limit(5);

      addDebugResult('RLS SELECT Policy', selectError ? 'error' : 'success',
        selectError ? `SELECT failed: ${selectError.message}` : `SELECT successful: ${selectTest?.length || 0} quotes found`,
        { selectTest, selectError }
      );

      // 4. Test RLS policies - INSERT
      const testQuoteData = {
        user_id: user.id,
        content: `Debug test quote - ${new Date().toISOString()}`,
        author: 'Debug Tester',
        category: 'Debug',
        is_custom: true
      };

      const { data: insertTest, error: insertError } = await supabase
        .from('quotes')
        .insert(testQuoteData)
        .select();

      addDebugResult('RLS INSERT Policy', insertError ? 'error' : 'success',
        insertError ? `INSERT failed: ${insertError.message}` : 'INSERT successful',
        { insertTest, insertError }
      );

      // 5. Test QuoteService.createQuote
      try {
        const serviceQuote = await QuoteService.createQuote({
          user_id: user.id,
          content: `Service test quote - ${new Date().toISOString()}`,
          author: 'Service Tester',
          category: 'Service Test',
          is_custom: true
        });

        addDebugResult('QuoteService.createQuote', 'success', 'Service method successful', serviceQuote);
      } catch (serviceError: any) {
        addDebugResult('QuoteService.createQuote', 'error', `Service method failed: ${serviceError.message}`, serviceError);
      }

      // 6. Test QuoteService.getQuotes
      try {
        const userQuotes = await QuoteService.getQuotes(user.id);
        addDebugResult('QuoteService.getQuotes', 'success', `Retrieved ${userQuotes.length} quotes`, { count: userQuotes.length });
      } catch (getError: any) {
        addDebugResult('QuoteService.getQuotes', 'error', `Get quotes failed: ${getError.message}`, getError);
      }

      // 7. Test current user's quotes count
      const { data: userQuotesCount, error: countError } = await supabase
        .from('quotes')
        .select('id')
        .eq('user_id', user.id);

      addDebugResult('User Quotes Count', countError ? 'error' : 'success',
        countError ? `Count failed: ${countError.message}` : `User has ${userQuotesCount?.length || 0} quotes`,
        { count: userQuotesCount?.length }
      );

    } catch (error: any) {
      addDebugResult('Debug Test Error', 'error', `Unexpected error: ${error.message}`, error);
    }
  };

  const testQuoteCreation = async () => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    try {
      const quote = await QuoteService.createQuote({
        user_id: user.id,
        content: testQuote.content,
        author: testQuote.author,
        category: testQuote.category,
        is_custom: true
      });

      toast.success('Quote created successfully!');
      addDebugResult('Manual Quote Test', 'success', 'Quote created via manual test', quote);
    } catch (error: any) {
      toast.error(`Failed to create quote: ${error.message}`);
      addDebugResult('Manual Quote Test', 'error', `Manual test failed: ${error.message}`, error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bug className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold">Quote CRUD Debug Panel</h3>
        </div>

        <div className="space-y-4">
          {/* User Status */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm">
              User Status: {user ? (
                <Badge variant="secondary" className="ml-2">
                  {user.email}
                </Badge>
              ) : (
                <Badge variant="destructive" className="ml-2">
                  Not Authenticated
                </Badge>
              )}
            </span>
          </div>

          {/* Test Buttons */}
          <div className="flex gap-2">
            <Button onClick={runFullDebugTest} variant="outline">
              <Database className="mr-2 h-4 w-4" />
              Run Full Debug Test
            </Button>
            <Button onClick={clearResults} variant="ghost" size="sm">
              Clear Results
            </Button>
          </div>

          {/* Manual Quote Test */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium">Manual Quote Creation Test</h4>
            <Textarea
              placeholder="Quote content"
              value={testQuote.content}
              onChange={(e) => setTestQuote(prev => ({ ...prev, content: e.target.value }))}
              className="min-h-20"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Author"
                value={testQuote.author}
                onChange={(e) => setTestQuote(prev => ({ ...prev, author: e.target.value }))}
              />
              <Input
                placeholder="Category"
                value={testQuote.category}
                onChange={(e) => setTestQuote(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>
            <Button onClick={testQuoteCreation} className="w-full">
              Test Quote Creation
            </Button>
          </div>
        </div>
      </Card>

      {/* Debug Results */}
      {debugResults.length > 0 && (
        <Card className="glass p-6">
          <h4 className="font-medium mb-4">Debug Results</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {debugResults.map((result, index) => (
              <div key={index} className="flex items-start gap-2 p-2 rounded border">
                {result.status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{result.test}</span>
                    <Badge variant={result.status === 'success' ? 'secondary' : 'destructive'} className="text-xs">
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-blue-500">Show Data</summary>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}