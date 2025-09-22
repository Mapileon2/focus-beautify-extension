import React from 'react';
import { TimerMode } from './FocusTimer';

interface TimerCircleProps {
  timeLeft: number;
  totalTime: number;
  mode: TimerMode;
  isRunning: boolean;
}

export function TimerCircle({ timeLeft, totalTime, mode, isRunning }: TimerCircleProps) {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getCircleColor = (mode: TimerMode) => {
    switch (mode) {
      case 'focus': 
        return 'hsl(var(--primary))';
      case 'break':
      case 'longBreak':
        return 'hsl(var(--secondary))';
      default:
        return 'hsl(var(--primary))';
    }
  };

  const getGlowColor = (mode: TimerMode) => {
    switch (mode) {
      case 'focus': 
        return 'hsl(var(--primary-glow))';
      case 'break':
      case 'longBreak':
        return 'hsl(var(--secondary-glow))';
      default:
        return 'hsl(var(--primary-glow))';
    }
  };

  return (
    <div className="relative">
      <svg
        width={radius * 2 + 40}
        height={radius * 2 + 40}
        className={`transform -rotate-90 transition-all duration-300 ${
          isRunning ? 'pulse-glow' : ''
        }`}
        style={{
          filter: `drop-shadow(0 0 20px ${getGlowColor(mode)}40)`,
        }}
      >
        {/* Background circle */}
        <circle
          cx={radius + 20}
          cy={radius + 20}
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth="3"
          fill="transparent"
          className="opacity-20"
        />
        
        {/* Progress circle */}
        <circle
          cx={radius + 20}
          cy={radius + 20}
          r={radius}
          stroke={getCircleColor(mode)}
          strokeWidth="6"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${getCircleColor(mode)}60)`,
          }}
        />
        
        {/* Inner glow effect */}
        <circle
          cx={radius + 20}
          cy={radius + 20}
          r={radius - 10}
          stroke={getGlowColor(mode)}
          strokeWidth="1"
          fill="transparent"
          className="opacity-30"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="glass rounded-full p-8 text-center">
          <div className="text-sm font-medium text-muted-foreground">
            {mode === 'focus' ? '🎯' : '☕'}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
}