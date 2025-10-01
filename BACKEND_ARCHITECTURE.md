# Backend Architecture - Focus Timer Extension

## Overview

This document outlines the backend architecture for the Focus Timer Chrome Extension, built with Supabase as the backend-as-a-service platform.

## Architecture Components

### 1. Database Layer (Supabase PostgreSQL)

#### Tables Structure:

- **users**: User profiles and authentication data
- **user_settings**: Personalized timer and app settings
- **focus_sessions**: Pomodoro session tracking and analytics
- **tasks**: Task management and todo lists
- **quotes**: Motivational quotes (public and custom)

#### Key Features:
- Row Level Security (RLS) for data isolation
- Real-time subscriptions for live updates
- Automatic timestamps and triggers
- Optimized indexes for performance

### 2. Authentication Layer (Supabase Auth)

#### Features:
- Email/password authentication
- Password reset functionality
- User profile management
- Session management
- Automatic user profile creation

#### Implementation:
- `AuthService`: Core authentication operations
- `useAuth` hook: React authentication state management
- `AuthProvider`: Context provider for app-wide auth state

### 3. Data Access Layer

#### Services:
- **AuthService**: Authentication operations
- **UserService**: User profile and settings management
- **SessionService**: Focus session CRUD and analytics
- **TaskService**: Task management operations
- **QuoteService**: Quote management and retrieval

#### React Query Integration:
- `useSupabaseQueries`: Custom hooks for data fetching
- Automatic caching and synchronization
- Optimistic updates for better UX
- Real-time data invalidation

### 4. Real-time Features

#### Capabilities:
- Live session tracking
- Real-time task updates
- Collaborative features (future)
- Push notifications (future)

## Data Models

### User Profile
```typescript
interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}
```

### Focus Session
```typescript
interface FocusSession {
  id: string
  user_id: string
  session_type: 'focus' | 'short_break' | 'long_break'
  duration_minutes: number
  completed: boolean
  started_at: string
  completed_at: string | null
  created_at: string
}
```

### Task
```typescript
interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  created_at: string
  updated_at: string
}
```

### Quote
```typescript
interface Quote {
  id: string
  user_id: string | null
  content: string
  author: string | null
  category: string | null
  is_custom: boolean
  created_at: string
}
```

### User Settings
```typescript
interface UserSettings {
  id: string
  user_id: string
  focus_duration: number
  short_break_duration: number
  long_break_duration: number
  sessions_until_long_break: number
  notifications_enabled: boolean
  sound_enabled: boolean
  theme: string
  created_at: string
  updated_at: string
}
```

## API Integration

### Supabase Configuration
- **URL**: https://sbiykywpmkqhmgzisrez.supabase.co
- **Anon Key**: Configured in `src/lib/supabase.ts`
- **Client**: Auto-configured with TypeScript types

### Security
- Row Level Security (RLS) enabled on all tables
- User-specific data isolation
- Secure API key management
- HTTPS-only connections

## Usage Examples

### Authentication
```typescript
import { useAuth } from '@/hooks/useAuth'

const { user, signIn, signOut, loading } = useAuth()

// Sign in
await signIn('user@example.com', 'password')

// Sign out
await signOut()
```

### Session Management
```typescript
import { useCreateSession, useCompleteSession } from '@/hooks/useSupabaseQueries'

const createSession = useCreateSession()
const completeSession = useCompleteSession()

// Start a focus session
await createSession.mutateAsync({
  user_id: user.id,
  session_type: 'focus',
  duration_minutes: 25
})

// Complete session
await completeSession.mutateAsync(sessionId)
```

### Task Management
```typescript
import { useTasks, useCreateTask, useToggleTask } from '@/hooks/useSupabaseQueries'

const { data: tasks } = useTasks()
const createTask = useCreateTask()
const toggleTask = useToggleTask()

// Create task
await createTask.mutateAsync({
  user_id: user.id,
  title: 'Complete project',
  priority: 'high'
})

// Toggle completion
await toggleTask.mutateAsync(taskId)
```

## Setup Instructions

### 1. Database Setup
1. Run the SQL schema in your Supabase dashboard:
   ```sql
   -- Execute the contents of supabase-schema.sql
   ```

### 2. Environment Configuration
1. Update Supabase credentials in `src/lib/supabase.ts`
2. Ensure CSP allows Supabase connections in `manifest.json`

### 3. Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Performance Optimizations

### Database
- Indexed columns for fast queries
- Efficient RLS policies
- Optimized query patterns

### Frontend
- React Query caching
- Optimistic updates
- Lazy loading
- Connection pooling

## Security Considerations

### Data Protection
- Row Level Security (RLS)
- User data isolation
- Secure authentication
- HTTPS-only connections

### Privacy
- Minimal data collection
- User-controlled data
- Secure data transmission
- GDPR compliance ready

## Monitoring and Analytics

### Built-in Analytics
- Session completion rates
- Task productivity metrics
- User engagement tracking
- Performance monitoring

### Future Enhancements
- Advanced analytics dashboard
- Export functionality
- Team collaboration features
- Mobile app synchronization

## Deployment

### Chrome Extension
1. Build the extension: `npm run build:extension`
2. Load in Chrome Developer Mode
3. Test all functionality

### Production Considerations
- Environment-specific configurations
- Error monitoring
- Performance tracking
- User feedback collection

## Support and Maintenance

### Regular Tasks
- Database maintenance
- Security updates
- Performance monitoring
- User support

### Backup Strategy
- Automated Supabase backups
- Data export capabilities
- Disaster recovery plan
- Version control for schema changes