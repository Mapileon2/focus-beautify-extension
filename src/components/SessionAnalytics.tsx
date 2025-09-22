import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  Target, 
  Award, 
  Flame,
  BarChart3,
  PieChart
} from 'lucide-react';

export function SessionAnalytics() {
  // Mock data - in real app this would come from your timer state/database
  const todayStats = {
    completedSessions: 6,
    totalFocusTime: 150, // minutes
    longestStreak: 4,
    goalProgress: 75, // percentage
  };

  const weeklyStats = {
    totalSessions: 28,
    totalFocusTime: 700, // minutes
    averageSessionLength: 25,
    productivity: 85, // percentage
  };

  const achievements = [
    { id: 1, title: 'Focus Master', description: 'Complete 100 sessions', progress: 67, max: 100 },
    { id: 2, title: 'Consistency Champion', description: '7 days in a row', progress: 5, max: 7 },
    { id: 3, title: 'Deep Work', description: '10 hours total focus time', progress: 8.5, max: 10 },
  ];

  const weeklyData = [
    { day: 'Mon', sessions: 5, minutes: 125 },
    { day: 'Tue', sessions: 4, minutes: 100 },
    { day: 'Wed', sessions: 6, minutes: 150 },
    { day: 'Thu', sessions: 3, minutes: 75 },
    { day: 'Fri', sessions: 5, minutes: 125 },
    { day: 'Sat', sessions: 3, minutes: 75 },
    { day: 'Sun', sessions: 2, minutes: 50 },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Today's Stats */}
        <TabsContent value="today" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-primary to-primary-glow">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{todayStats.completedSessions}</p>
                  <p className="text-sm text-muted-foreground">Sessions Completed</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-accent to-accent-glow">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{todayStats.totalFocusTime}</p>
                  <p className="text-sm text-muted-foreground">Minutes Focused</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-secondary to-secondary-glow">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{todayStats.longestStreak}</p>
                  <p className="text-sm text-muted-foreground">Longest Streak</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-destructive to-orange-500">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{todayStats.goalProgress}%</p>
                  <p className="text-sm text-muted-foreground">Daily Goal</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Daily Goal Progress */}
          <Card className="glass p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Daily Goal Progress</h3>
                <Badge variant="secondary">{todayStats.completedSessions}/8 sessions</Badge>
              </div>
              <Progress value={todayStats.goalProgress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                You're {todayStats.goalProgress}% of the way to your daily goal! Keep it up! 🎯
              </p>
            </div>
          </Card>

          {/* Focus Time Distribution */}
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Today's Session Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Work Sessions</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-gradient-to-r from-primary to-primary-glow"></div>
                  </div>
                  <span className="text-sm font-medium">6</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Break Time</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-gradient-to-r from-secondary to-secondary-glow"></div>
                  </div>
                  <span className="text-sm font-medium">30 min</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Weekly Stats */}
        <TabsContent value="week" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-primary to-primary-glow">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{weeklyStats.totalSessions}</p>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-accent to-accent-glow">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{Math.floor(weeklyStats.totalFocusTime / 60)}h {weeklyStats.totalFocusTime % 60}m</p>
                  <p className="text-sm text-muted-foreground">Focus Time</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-secondary to-secondary-glow">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{weeklyStats.averageSessionLength}</p>
                  <p className="text-sm text-muted-foreground">Avg Session</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-destructive to-orange-500">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{weeklyStats.productivity}%</p>
                  <p className="text-sm text-muted-foreground">Productivity</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Weekly Chart */}
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Weekly Progress</h3>
            <div className="space-y-4">
              {weeklyData.map((day) => (
                <div key={day.day} className="flex items-center gap-4">
                  <div className="w-12 text-sm text-muted-foreground">{day.day}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>{day.sessions} sessions</span>
                      <span>{day.minutes} min</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full"
                        style={{ width: `${(day.sessions / 6) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="glass p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-r from-accent to-accent-glow">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground">{achievement.progress}/{achievement.max}</span>
                    </div>
                    <Progress value={(achievement.progress / achievement.max) * 100} className="h-2" />
                  </div>
                  {achievement.progress >= achievement.max && (
                    <Badge variant="secondary" className="w-full justify-center">
                      <Award className="mr-1 h-3 w-3" />
                      Completed!
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Streak Info */}
          <Card className="glass p-6">
            <div className="text-center space-y-4">
              <div className="text-4xl">🔥</div>
              <h3 className="text-xl font-semibold text-foreground">Current Streak</h3>
              <p className="text-3xl font-bold text-primary">5 Days</p>
              <p className="text-muted-foreground">
                You're on fire! Keep the momentum going to unlock new achievements.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}