import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { DatabaseSetup, SetupResult } from '@/utils/databaseSetup'
import { AlertTriangle, Database, ExternalLink, Copy, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export const DatabaseSetupGuide: React.FC = () => {
  const [setupResults, setSetupResults] = useState<SetupResult[]>([])
  const [checking, setChecking] = useState(false)
  const [summary, setSummary] = useState({ total: 0, success: 0, errors: 0, warnings: 0, successRate: 0, needsSetup: false, isReady: false })

  const checkDatabaseSetup = async () => {
    setChecking(true)
    try {
      const setup = new DatabaseSetup()
      const results = await setup.verifyDatabaseSetup()
      const setupSummary = setup.getSummary()
      
      setSetupResults(results)
      setSummary(setupSummary)
    } catch (error) {
      console.error('Database setup check failed:', error)
      toast.error('Failed to check database setup')
    } finally {
      setChecking(false)
    }
  }

  const copySetupScript = async () => {
    try {
      // Fetch the setup script content
      const response = await fetch('/setup-database-simple.sql')
      if (response.ok) {
        const setupScript = await response.text()
        await navigator.clipboard.writeText(setupScript)
        toast.success('Complete setup script copied to clipboard!')
      } else {
        // Fallback to inline script
        const fallbackScript = `-- Focus Timer Database Setup Script
-- Copy this entire script and run it in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    focus_duration INTEGER DEFAULT 25,
    short_break_duration INTEGER DEFAULT 5,
    long_break_duration INTEGER DEFAULT 15,
    sessions_until_long_break INTEGER DEFAULT 4,
    notifications_enabled BOOLEAN DEFAULT true,
    sound_enabled BOOLEAN DEFAULT true,
    theme TEXT DEFAULT 'light',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create focus_sessions table
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    session_type TEXT CHECK (session_type IN ('focus', 'short_break', 'long_break')) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT false,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author TEXT,
    category TEXT,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security and create policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic version)
CREATE POLICY "Users can manage own data" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sessions" ON public.focus_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view all quotes" ON public.quotes FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can manage own quotes" ON public.quotes FOR ALL USING (auth.uid() = user_id);

-- Insert sample quotes
INSERT INTO public.quotes (content, author, category, is_custom) VALUES
('The way to get started is to quit talking and begin doing.', 'Walt Disney', 'motivation', false),
('Focus on being productive instead of busy.', 'Tim Ferriss', 'productivity', false),
('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'motivation', false)
ON CONFLICT DO NOTHING;`

        await navigator.clipboard.writeText(fallbackScript)
        toast.success('Setup script copied to clipboard!')
      }
    } catch (error) {
      toast.error('Failed to copy script. Please copy manually from setup-database-simple.sql file.')
    }
  }

  const openSupabaseDashboard = () => {
    window.open('https://sbiykywpmkqhmgzisrez.supabase.co', '_blank')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Database className="h-4 w-4" />
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
      {/* Setup Status Alert */}
      {summary.needsSetup && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <p><strong>Database Setup Required!</strong></p>
              <p>The database tables haven't been created yet. You need to run the setup script in your Supabase dashboard.</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openSupabaseDashboard}
                  className="bg-white"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Supabase Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copySetupScript}
                  className="bg-white"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Setup Script
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Database Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to set up your Supabase database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-bold">1</div>
              <div>
                <p className="font-medium">Open Supabase Dashboard</p>
                <p className="text-sm text-muted-foreground">Navigate to your Supabase project dashboard</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openSupabaseDashboard}
                  className="mt-2"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Dashboard
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-bold">2</div>
              <div>
                <p className="font-medium">Go to SQL Editor</p>
                <p className="text-sm text-muted-foreground">In the left sidebar, click "SQL Editor" → "New Query"</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-bold">3</div>
              <div>
                <p className="font-medium">Run Setup Script</p>
                <p className="text-sm text-muted-foreground">Copy the contents of <code>setup-database.sql</code> and paste it into the SQL editor, then click "Run"</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copySetupScript}
                  className="mt-2"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Setup Script
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-white text-sm flex items-center justify-center font-bold">4</div>
              <div>
                <p className="font-medium">Verify Setup</p>
                <p className="text-sm text-muted-foreground">Click the button below to verify that all tables were created successfully</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={checkDatabaseSetup}
                  disabled={checking}
                  className="mt-2"
                >
                  <Database className="mr-2 h-4 w-4" />
                  {checking ? 'Checking...' : 'Verify Setup'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Verification Results */}
      {setupResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Verification Results</CardTitle>
            <CardDescription>
              Database setup verification status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${summary.isReady ? 'text-green-600' : 'text-red-600'}`}>
                    {summary.isReady ? '✅' : '❌'}
                  </div>
                  <div className="text-sm text-muted-foreground">Ready</div>
                </div>
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
              </div>

              {/* Detailed Results */}
              <div className="space-y-2">
                {setupResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">{result.step}</div>
                        <div className="text-sm text-muted-foreground">{result.message}</div>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(result.status)}>
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>

              {summary.isReady && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Database setup complete!</strong> All tables are created and ready to use. You can now use all features of the Focus Timer extension.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}