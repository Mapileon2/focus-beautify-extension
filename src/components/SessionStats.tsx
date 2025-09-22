import React from 'react';
import { Card } from '@/components/ui/card';
import { TimerMode } from './FocusTimer';

interface SessionStatsProps {
  currentSession: number;
  totalSessions: number;
  mode: TimerMode;
}

export function SessionStats({ currentSession, totalSessions, mode }: SessionStatsProps) {
  const todayGoal = 8; // 8 pomodoro sessions per day
  const progressPercentage = (totalSessions / todayGoal) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="glass p-4 text-center">
        <div className="text-2xl font-bold text-foreground">{currentSession}</div>
        <div className="text-sm text-muted-foreground">Current Session</div>
      </Card>

      <Card className="glass p-4 text-center">
        <div className="text-2xl font-bold text-accent">{totalSessions}</div>
        <div className="text-sm text-muted-foreground">Completed Today</div>
      </Card>

      <Card className="glass p-4 text-center">
        <div className="text-2xl font-bold text-secondary">
          {Math.round(progressPercentage)}%
        </div>
        <div className="text-sm text-muted-foreground">Daily Goal</div>
      </Card>
    </div>
  );
}