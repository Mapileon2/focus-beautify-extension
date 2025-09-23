import React from 'react';
import { TimerMode } from './FocusTimer';

interface TimerCircleProps {
  timeLeft: number;
  totalTime: number;
  mode: TimerMode;
  isRunning: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function TimerCircle({ timeLeft, totalTime, mode, isRunning, size = 'lg' }: TimerCircleProps) {
  const sizes = {
    sm: { radius: 40, strokeWidth: 3 },
    md: { radius: 80, strokeWidth: 4 },
    lg: { radius: 120, strokeWidth: 6 }
  };
  
  const currentSize = sizes[size];
  const circumference = 2 * Math.PI * currentSize.radius;
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
        width={currentSize.radius * 2 + 40}
        height={currentSize.radius * 2 + 40}
        className={`transform -rotate-90 transition-all duration-300 ${
          isRunning ? 'pulse-glow' : ''
        }`}
        style={{
          filter: `drop-shadow(0 0 20px ${getGlowColor(mode)}40)`,
        }}
      >
        {/* Background circle */}
        <circle
          cx={currentSize.radius + 20}
          cy={currentSize.radius + 20}
          r={currentSize.radius}
          stroke="hsl(var(--border))"
          strokeWidth="3"
          fill="transparent"
          className="opacity-20"
        />
        
        {/* Progress circle */}
        <circle
          cx={currentSize.radius + 20}
          cy={currentSize.radius + 20}
          r={currentSize.radius}
          stroke={getCircleColor(mode)}
          strokeWidth={currentSize.strokeWidth}
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
          cx={currentSize.radius + 20}
          cy={currentSize.radius + 20}
          r={currentSize.radius - 10}
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
        <div className={`glass rounded-full text-center ${
          size === 'sm' ? 'p-2' : size === 'md' ? 'p-4' : 'p-8'
        }`}>
          <div className={`font-medium text-muted-foreground ${
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-sm'
          }`}>
            {mode === 'focus' ? '🎯' : '☕'}
          </div>
          <div className={`mt-1 text-muted-foreground ${
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-xs' : 'text-xs'
          }`}>
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
}