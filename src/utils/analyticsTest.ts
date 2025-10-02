/**
 * Analytics Integration Test
 * Tests the complete analytics pipeline from database to visualization
 */

import { SessionService } from '@/services/sessionService';
import { supabase } from '@/lib/supabase';

export interface AnalyticsTestResult {
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

export class AnalyticsTest {
  
  /**
   * Test database connection and focus_sessions table access
   */
  static async testDatabaseConnection(): Promise<AnalyticsTestResult> {
    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('count(*)')
        .limit(1);

      if (error) {
        return {
          success: false,
          message: 'Database connection failed',
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Database connection successful',
        details: { tableAccess: 'focus_sessions table accessible' }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Database connection error',
        error: error.message
      };
    }
  }

  /**
   * Test session data retrieval
   */
  static async testSessionDataRetrieval(userId: string): Promise<AnalyticsTestResult> {
    try {
      // Test getUserSessions
      const sessions = await SessionService.getUserSessions(userId, 10);
      
      // Test getTodaySessions
      const todaySessions = await SessionService.getTodaySessions(userId);
      
      // Test getSessionStats
      const stats = await SessionService.getSessionStats(userId);

      return {
        success: true,
        message: 'Session data retrieval successful',
        details: {
          totalSessions: sessions.length,
          todaySessions: todaySessions.length,
          stats: {
            totalSessions: stats.totalSessions,
            totalFocusTime: stats.totalFocusTime,
            averageSessionLength: stats.averageSessionLength
          }
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Session data retrieval failed',
        error: error.message
      };
    }
  }

  /**
   * Test analytics calculations
   */
  static async testAnalyticsCalculations(userId: string): Promise<AnalyticsTestResult> {
    try {
      const sessions = await SessionService.getUserSessions(userId, 100);
      const todaySessions = await SessionService.getTodaySessions(userId);

      // Test today's stats calculation
      const todayFocusSessions = todaySessions.filter(s => s.session_type === 'focus' && s.completed);
      const todayFocusTime = todayFocusSessions.reduce((sum, s) => sum + s.duration_minutes, 0);

      // Test weekly data calculation
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklySessions = sessions.filter(s => new Date(s.created_at) >= weekAgo);

      // Test session type distribution
      const focusSessions = sessions.filter(s => s.session_type === 'focus' && s.completed).length;
      const shortBreaks = sessions.filter(s => s.session_type === 'short_break' && s.completed).length;
      const longBreaks = sessions.filter(s => s.session_type === 'long_break' && s.completed).length;

      // Test streak calculation
      const sortedSessions = [...sessions]
        .filter(s => s.session_type === 'focus' && s.completed)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      let currentStreak = 0;
      let lastDate = null;
      
      for (const session of sortedSessions) {
        const sessionDate = new Date(session.created_at);
        sessionDate.setHours(0, 0, 0, 0);
        
        if (!lastDate) {
          lastDate = sessionDate;
          currentStreak = 1;
        } else {
          const dayDiff = Math.floor((lastDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
          if (dayDiff === 1) {
            currentStreak++;
            lastDate = sessionDate;
          } else if (dayDiff > 1) {
            break;
          }
        }
      }

      return {
        success: true,
        message: 'Analytics calculations successful',
        details: {
          todayStats: {
            focusSessions: todayFocusSessions.length,
            focusTime: todayFocusTime
          },
          weeklyStats: {
            totalSessions: weeklySessions.length
          },
          sessionDistribution: {
            focus: focusSessions,
            shortBreaks: shortBreaks,
            longBreaks: longBreaks
          },
          streak: currentStreak
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Analytics calculations failed',
        error: error.message
      };
    }
  }

  /**
   * Test chart data generation
   */
  static async testChartDataGeneration(userId: string): Promise<AnalyticsTestResult> {
    try {
      const sessions = await SessionService.getUserSessions(userId, 100);

      // Generate weekly chart data
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString('en', { weekday: 'short' });
        
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const daySessions = sessions.filter(s => {
          const sessionDate = new Date(s.created_at);
          return sessionDate >= dayStart && sessionDate <= dayEnd && s.completed && s.session_type === 'focus';
        });
        
        weeklyData.push({
          day: dayName,
          sessions: daySessions.length,
          minutes: daySessions.reduce((sum, s) => sum + s.duration_minutes, 0)
        });
      }

      // Generate pie chart data
      const focusSessions = sessions.filter(s => s.session_type === 'focus' && s.completed).length;
      const shortBreaks = sessions.filter(s => s.session_type === 'short_break' && s.completed).length;
      const longBreaks = sessions.filter(s => s.session_type === 'long_break' && s.completed).length;
      
      const sessionTypeData = [
        { name: 'Focus', value: focusSessions, color: '#3b82f6' },
        { name: 'Short Break', value: shortBreaks, color: '#10b981' },
        { name: 'Long Break', value: longBreaks, color: '#f59e0b' }
      ].filter(d => d.value > 0);

      return {
        success: true,
        message: 'Chart data generation successful',
        details: {
          weeklyData: weeklyData,
          sessionTypeData: sessionTypeData,
          dataPoints: weeklyData.length,
          hasData: weeklyData.some(d => d.sessions > 0)
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Chart data generation failed',
        error: error.message
      };
    }
  }

  /**
   * Test achievement calculations
   */
  static async testAchievementCalculations(userId: string): Promise<AnalyticsTestResult> {
    try {
      const sessions = await SessionService.getUserSessions(userId, 1000);
      
      const totalFocusSessions = sessions.filter(s => s.session_type === 'focus' && s.completed).length;
      const totalFocusHours = sessions
        .filter(s => s.session_type === 'focus' && s.completed)
        .reduce((sum, s) => sum + s.duration_minutes, 0) / 60;

      const startedSessions = sessions.length;
      const completedSessions = sessions.filter(s => s.completed).length;
      const productivity = startedSessions > 0 ? (completedSessions / startedSessions) * 100 : 0;

      const achievements = [
        { 
          title: 'Focus Master', 
          progress: Math.min(totalFocusSessions, 100), 
          max: 100,
          percentage: (Math.min(totalFocusSessions, 100) / 100) * 100
        },
        { 
          title: 'Deep Work Master', 
          progress: Math.min(Math.floor(totalFocusHours), 50), 
          max: 50,
          percentage: (Math.min(Math.floor(totalFocusHours), 50) / 50) * 100
        },
        { 
          title: 'Productivity Pro', 
          progress: Math.min(Math.floor(productivity), 90), 
          max: 90,
          percentage: (Math.min(Math.floor(productivity), 90) / 90) * 100
        }
      ];

      return {
        success: true,
        message: 'Achievement calculations successful',
        details: {
          totalFocusSessions,
          totalFocusHours: Math.round(totalFocusHours * 10) / 10,
          productivity: Math.round(productivity),
          achievements: achievements
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Achievement calculations failed',
        error: error.message
      };
    }
  }

  /**
   * Create sample session data for testing
   */
  static async createSampleData(userId: string): Promise<AnalyticsTestResult> {
    try {
      const sampleSessions = [
        // Today's sessions
        {
          user_id: userId,
          session_type: 'focus' as const,
          duration_minutes: 25,
          completed: true,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        },
        {
          user_id: userId,
          session_type: 'short_break' as const,
          duration_minutes: 5,
          completed: true,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        },
        // Yesterday's sessions
        {
          user_id: userId,
          session_type: 'focus' as const,
          duration_minutes: 25,
          completed: true,
          started_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      for (const session of sampleSessions) {
        await SessionService.createSession(session);
      }

      return {
        success: true,
        message: 'Sample data created successfully',
        details: { sessionsCreated: sampleSessions.length }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Sample data creation failed',
        error: error.message
      };
    }
  }

  /**
   * Run comprehensive analytics test
   */
  static async runComprehensiveTest(userId: string): Promise<{
    overall: boolean;
    results: Record<string, AnalyticsTestResult>;
  }> {
    const results: Record<string, AnalyticsTestResult> = {};

    // Test 1: Database Connection
    results.databaseConnection = await this.testDatabaseConnection();

    // Test 2: Session Data Retrieval
    results.sessionDataRetrieval = await this.testSessionDataRetrieval(userId);

    // Test 3: Analytics Calculations
    results.analyticsCalculations = await this.testAnalyticsCalculations(userId);

    // Test 4: Chart Data Generation
    results.chartDataGeneration = await this.testChartDataGeneration(userId);

    // Test 5: Achievement Calculations
    results.achievementCalculations = await this.testAchievementCalculations(userId);

    const overall = Object.values(results).every(result => result.success);

    return { overall, results };
  }
}

// Export for use in components
export default AnalyticsTest;