import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Trophy, 
  Target, 
  Calendar, 
  Settings as SettingsIcon,
  Edit,
  Camera,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';

export function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    location: 'San Francisco, CA',
    joinDate: 'January 2024',
    avatar: '',
    bio: 'Passionate about productivity and focused work. Building better habits one Pomodoro at a time.',
  });

  const stats = {
    totalSessions: 234,
    totalHours: 97.5,
    currentStreak: 12,
    longestStreak: 28,
    level: 8,
    experiencePoints: 2340,
    nextLevelPoints: 3000,
  };

  const achievements = [
    { id: 1, title: 'First Session', description: 'Complete your first focus session', unlocked: true, icon: '🎯' },
    { id: 2, title: 'Week Warrior', description: 'Maintain a 7-day streak', unlocked: true, icon: '🔥' },
    { id: 3, title: 'Century Club', description: 'Complete 100 focus sessions', unlocked: true, icon: '💯' },
    { id: 4, title: 'Marathon Master', description: 'Focus for 100 hours total', unlocked: false, icon: '🏃‍♂️' },
    { id: 5, title: 'Consistency King', description: '30-day streak', unlocked: false, icon: '👑' },
    { id: 6, title: 'Zen Master', description: 'Complete 1000 sessions', unlocked: false, icon: '🧘‍♂️' },
  ];

  const recentActivity = [
    { date: '2024-01-15', sessions: 6, minutes: 150, type: 'Productive Day' },
    { date: '2024-01-14', sessions: 4, minutes: 100, type: 'Steady Progress' },
    { date: '2024-01-13', sessions: 5, minutes: 125, type: 'Good Focus' },
    { date: '2024-01-12', sessions: 7, minutes: 175, type: 'Peak Performance' },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Profile Header */}
          <Card className="glass p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-lg bg-gradient-to-r from-primary to-primary-glow text-white">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border border-border"
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                  <Badge variant="secondary">Level {stats.level}</Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {profile.joinDate}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              </div>

              <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-primary to-primary-glow">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{stats.totalSessions}</p>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-accent to-accent-glow">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{stats.totalHours}h</p>
                  <p className="text-sm text-muted-foreground">Focus Time</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-secondary to-secondary-glow">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{stats.currentStreak}</p>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-destructive to-orange-500">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{stats.level}</p>
                  <p className="text-sm text-muted-foreground">Level</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Experience Progress */}
          <Card className="glass p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Experience Progress</h3>
                <Badge variant="outline">{stats.experiencePoints} / {stats.nextLevelPoints} XP</Badge>
              </div>
              <Progress 
                value={(stats.experiencePoints / stats.nextLevelPoints) * 100} 
                className="h-3" 
              />
              <p className="text-sm text-muted-foreground">
                {stats.nextLevelPoints - stats.experiencePoints} XP until Level {stats.level + 1}
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={`glass p-6 transition-all ${
                  achievement.unlocked 
                    ? 'glow-primary cursor-pointer hover:scale-105' 
                    : 'opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div>
                    <h4 className="font-semibold text-foreground">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  <Badge variant={achievement.unlocked ? "secondary" : "outline"}>
                    {achievement.unlocked ? 'Unlocked' : 'Locked'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center text-white font-bold">
                      {activity.sessions}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{activity.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString()} • {activity.minutes} minutes
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{activity.sessions} sessions</Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}