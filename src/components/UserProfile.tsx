import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  useUserProfile, 
  useUpdateUserProfile, 
  useUserStatistics, 
  useUserAchievements, 
  useUserGoals,
  useUserActivityLog,
  useUserPreferences,
  useUpdateUserPreferences
} from '@/hooks/useSupabaseQueries';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
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
  Clock,
  Award,
  TrendingUp,
  Activity,
  Save,
  Loader2,
  Globe,
  Linkedin,
  Twitter,
  Phone,
  Link,
  CheckCircle,
  Star,
  Flame,
  Zap
} from 'lucide-react';

export function UserProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: '',
    linkedin_url: '',
    twitter_handle: '',
    phone: '',
  });

  // Data fetching hooks
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: statistics, isLoading: statsLoading } = useUserStatistics();
  const { data: achievements, isLoading: achievementsLoading } = useUserAchievements();
  const { data: goals, isLoading: goalsLoading } = useUserGoals(true);
  const { data: activityLog, isLoading: activityLoading } = useUserActivityLog(20);
  const { data: preferences } = useUserPreferences();

  // Mutation hooks
  const updateProfile = useUpdateUserProfile();
  const updatePreferences = useUpdateUserPreferences();

  // Initialize edit form when profile loads
  React.useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        linkedin_url: profile.linkedin_url || '',
        twitter_handle: profile.twitter_handle || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync(editForm);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const calculateNextLevelXP = (currentLevel: number) => {
    return Math.pow(currentLevel, 2) * 100;
  };

  const getProfileCompletionTasks = () => {
    if (!profile) return [];
    
    const tasks = [
      { field: 'full_name', label: 'Add your name', completed: !!profile.full_name },
      { field: 'bio', label: 'Write a bio', completed: !!profile.bio },
      { field: 'location', label: 'Add your location', completed: !!profile.location },
      { field: 'avatar_url', label: 'Upload profile picture', completed: !!profile.avatar_url },
      { field: 'website', label: 'Add website', completed: !!profile.website },
    ];
    
    return tasks;
  };

  if (profileLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 glass">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Profile Header */}
          <Card className="glass p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-lg bg-gradient-to-r from-primary to-primary-glow text-white">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('') || user?.email?.[0].toUpperCase()}
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
                  <h2 className="text-2xl font-bold text-foreground">
                    {profile?.full_name || 'Anonymous User'}
                  </h2>
                  <Badge variant="secondary">Level {statistics?.current_level || 1}</Badge>
                  {profile?.profile_completion_score === 100 && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </div>
                  {profile?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(profile?.created_at || '').toLocaleDateString()}
                  </div>
                </div>
                
                {profile?.bio && (
                  <p className="text-sm text-muted-foreground">{profile.bio}</p>
                )}

                {/* Social Links */}
                <div className="flex gap-2 mt-2">
                  {profile?.website && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={profile.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {profile?.linkedin_url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {profile?.twitter_handle && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`https://twitter.com/${profile.twitter_handle}`} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={editForm.location}
                          onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="City, Country"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        className="min-h-20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={editForm.website}
                          onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={editForm.phone}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                        <Input
                          id="linkedin_url"
                          value={editForm.linkedin_url}
                          onChange={(e) => setEditForm(prev => ({ ...prev, linkedin_url: e.target.value }))}
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter_handle">Twitter Handle</Label>
                        <Input
                          id="twitter_handle"
                          value={editForm.twitter_handle}
                          onChange={(e) => setEditForm(prev => ({ ...prev, twitter_handle: e.target.value }))}
                          placeholder="@username"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                        {updateProfile.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Card>

          {/* Profile Completion */}
          {profile && profile.profile_completion_score < 100 && (
            <Card className="glass p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Complete Your Profile</h3>
                  <Badge variant="outline">{profile.profile_completion_score}% Complete</Badge>
                </div>
                <Progress value={profile.profile_completion_score} className="h-2" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {getProfileCompletionTasks().map((task, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {task.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                      )}
                      <span className={task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}>
                        {task.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-primary to-primary-glow">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{statistics?.total_sessions || 0}</p>
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
                  <p className="text-lg font-bold text-foreground">
                    {Math.round((statistics?.total_focus_time || 0) / 60)}h
                  </p>
                  <p className="text-sm text-muted-foreground">Focus Time</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{statistics?.current_streak || 0}</p>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{statistics?.current_level || 1}</p>
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
                <Badge variant="outline">
                  {statistics?.experience_points || 0} / {calculateNextLevelXP(statistics?.current_level || 1)} XP
                </Badge>
              </div>
              <Progress 
                value={((statistics?.experience_points || 0) / calculateNextLevelXP(statistics?.current_level || 1)) * 100} 
                className="h-3" 
              />
              <p className="text-sm text-muted-foreground">
                {calculateNextLevelXP(statistics?.current_level || 1) - (statistics?.experience_points || 0)} XP until Level {(statistics?.current_level || 1) + 1}
              </p>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="glass p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Today's Focus</span>
                </div>
                <p className="text-2xl font-bold">{statistics?.today_focus_time || 0}m</p>
                <p className="text-xs text-muted-foreground">
                  Goal: {preferences?.daily_focus_goal || 120}m
                </p>
              </div>
            </Card>

            <Card className="glass p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Achievements</span>
                </div>
                <p className="text-2xl font-bold">{statistics?.total_achievements || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {achievements?.filter(a => a.progress >= a.max_progress).length || 0} unlocked
                </p>
              </div>
            </Card>

            <Card className="glass p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Best Streak</span>
                </div>
                <p className="text-2xl font-bold">{statistics?.longest_streak || 0}</p>
                <p className="text-xs text-muted-foreground">days in a row</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          {achievementsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {achievements?.map((achievement) => {
                const isUnlocked = achievement.progress >= achievement.max_progress;
                return (
                  <Card 
                    key={achievement.id} 
                    className={`glass p-6 transition-all ${
                      isUnlocked 
                        ? 'glow-primary cursor-pointer hover:scale-105' 
                        : 'opacity-60'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="text-3xl">{achievement.achievement_icon || '🏆'}</div>
                      <div>
                        <h4 className="font-semibold text-foreground">{achievement.achievement_name}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.achievement_description}</p>
                      </div>
                      
                      {achievement.max_progress > 1 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.max_progress}</span>
                          </div>
                          <Progress value={(achievement.progress / achievement.max_progress) * 100} className="h-2" />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Badge variant={isUnlocked ? "secondary" : "outline"}>
                          {isUnlocked ? 'Unlocked' : 'Locked'}
                        </Badge>
                        {achievement.points_awarded > 0 && (
                          <Badge variant="outline" className="text-xs">
                            +{achievement.points_awarded} XP
                          </Badge>
                        )}
                      </div>
                      
                      {isUnlocked && achievement.unlocked_at && (
                        <p className="text-xs text-muted-foreground">
                          Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          {goalsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {goals?.map((goal) => (
                <Card key={goal.id} className="glass p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{goal.goal_name}</h4>
                        <p className="text-sm text-muted-foreground">{goal.goal_description}</p>
                      </div>
                      <Badge variant={goal.is_completed ? "secondary" : "outline"}>
                        {goal.is_completed ? 'Completed' : 'Active'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{goal.current_value}/{goal.target_value} {goal.unit}</span>
                      </div>
                      <Progress value={(goal.current_value / goal.target_value) * 100} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Started: {new Date(goal.start_date).toLocaleDateString()}</span>
                      {goal.end_date && (
                        <span>Ends: {new Date(goal.end_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              {(!goals || goals.length === 0) && (
                <Card className="glass p-8 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Active Goals</h3>
                  <p className="text-muted-foreground mb-4">Set some goals to track your progress!</p>
                  <Button>Create Your First Goal</Button>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          {activityLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Card className="glass p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Activity</h3>
              <div className="space-y-4">
                {activityLog?.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">
                        {activity.activity_description || activity.activity_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {(!activityLog || activityLog.length === 0) && (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Profile Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Profile Visibility</p>
                  <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                </div>
                <Badge variant="outline">{profile?.profile_visibility || 'private'}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Onboarding Status</p>
                  <p className="text-sm text-muted-foreground">Complete setup process</p>
                </div>
                <Badge variant={profile?.onboarding_completed ? "secondary" : "outline"}>
                  {profile?.onboarding_completed ? 'Complete' : 'Incomplete'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Last Active</p>
                  <p className="text-sm text-muted-foreground">When you last used the app</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {profile?.last_active_at ? new Date(profile.last_active_at).toLocaleString() : 'Never'}
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}