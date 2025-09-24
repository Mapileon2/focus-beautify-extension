import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Clock, 
  Target, 
  Award, 
  Flame,
  BarChart3,
  PieChart
} from 'lucide-react';

export function SessionAnalytics() {
  // Get stats from localStorage or initialize empty stats
  const getStoredStats = () => {
    const stored = localStorage.getItem('pomodoro_stats');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return getDefaultStats();
      }
    }
    return getDefaultStats();
  };

  const getDefaultStats = () => ({
    todayStats: {
      completedSessions: 0,
      totalFocusTime: 0,
      longestStreak: 0,
      goalProgress: 0,
    },
    weeklyStats: {
      totalSessions: 0,
      totalFocusTime: 0,
      averageSessionLength: 25,
      productivity: 0,
    },
    achievements: [
      { id: 1, title: 'Focus Master', description: 'Complete 100 sessions', progress: 0, max: 100 },
      { id: 2, title: 'Consistency Champion', description: '7 days in a row', progress: 0, max: 7 },
      { id: 3, title: 'Deep Work', description: '10 hours total focus time', progress: 0, max: 10 },
    ],
    weeklyData: [
      { day: 'Mon', sessions: 0, minutes: 0 },
      { day: 'Tue', sessions: 0, minutes: 0 },
      { day: 'Wed', sessions: 0, minutes: 0 },
      { day: 'Thu', sessions: 0, minutes: 0 },
      { day: 'Fri', sessions: 0, minutes: 0 },
      { day: 'Sat', sessions: 0, minutes: 0 },
      { day: 'Sun', sessions: 0, minutes: 0 },
    ]
  });

  const stats = getStoredStats();
  const { todayStats, weeklyStats, achievements, weeklyData } = stats;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Today's Stats */}
        <TabsContent value="today" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sessions</p>
                    <p className="text-2xl font-bold text-primary">{todayStats.completedSessions}</p>
                  </div>
                  <Clock className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Focus Time</p>
                    <p className="text-2xl font-bold text-primary">{todayStats.totalFocusTime}m</p>
                  </div>
                  <Target className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Streak</p>
                    <p className="text-2xl font-bold text-orange-500">{todayStats.longestStreak}</p>
                  </div>
                  <Flame className="h-8 w-8 text-orange-500/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Goal</p>
                    <p className="text-2xl font-bold text-green-500">{todayStats.goalProgress}%</p>
                  </div>
                  <Award className="h-8 w-8 text-green-500/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Daily Goal Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Focus Sessions</span>
                  <span>{todayStats.completedSessions}/8</span>
                </div>
                <Progress value={todayStats.goalProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Stats */}
        <TabsContent value="week" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                    <p className="text-2xl font-bold text-primary">{weeklyStats.totalSessions}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Focus Hours</p>
                    <p className="text-2xl font-bold text-primary">{Math.round(weeklyStats.totalFocusTime / 60)}h</p>
                  </div>
                  <Clock className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Length</p>
                    <p className="text-2xl font-bold text-primary">{weeklyStats.averageSessionLength}m</p>
                  </div>
                  <PieChart className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Productivity</p>
                    <p className="text-2xl font-bold text-green-500">{weeklyStats.productivity}%</p>
                  </div>
                  <Award className="h-8 w-8 text-green-500/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="glass">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Award className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                    <Badge variant={achievement.progress >= achievement.max ? "default" : "secondary"}>
                      {achievement.progress}/{achievement.max}
                    </Badge>
                  </div>
                  <Progress 
                    value={(achievement.progress / achievement.max) * 100} 
                    className="h-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}