# Storage Migration Plan

## Current Status: ✅ 85% Complete

### ✅ **Already Migrated to Supabase:**
- User profiles and authentication
- Tasks with full CRUD operations
- Focus sessions and analytics
- Quotes system with custom user quotes
- User settings (timer preferences, notifications)

### 🔄 **Hybrid Storage (Intentional):**
- Chrome extension settings (smilePopupSettings, appSettings)
- These should remain in Chrome storage for extension functionality

### ⚠️ **Needs Migration:**

#### 1. Gemini AI Settings
**Current:** localStorage
**Target:** user_settings table
**Files to update:**
- `src/hooks/useGeminiSettings.ts`
- `src/components/GeminiAISettings.tsx`

#### 2. Quote Storage Fallbacks
**Current:** localStorage fallbacks in components
**Target:** Remove fallbacks, use Supabase exclusively
**Files to update:**
- `src/components/SmilePopup.tsx`
- `src/components/ExternalSmilePopup.tsx`

#### 3. Session Analytics Fallback
**Current:** localStorage fallback
**Target:** Use Supabase session data exclusively
**Files to update:**
- `src/components/SessionAnalytics.tsx`

## Migration Tasks:

### Task 1: Extend user_settings table
```sql
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS gemini_model TEXT DEFAULT 'gemini-pro';
```

### Task 2: Update Gemini Settings Hook
- Modify `useGeminiSettings` to use Supabase
- Add migration logic for existing localStorage data
- Update all components using Gemini settings

### Task 3: Clean Up Quote Storage
- Remove localStorage fallbacks from SmilePopup components
- Ensure all quote operations use QuoteService
- Remove unused quote storage utilities

### Task 4: Update Session Analytics
- Remove localStorage fallback
- Use existing SessionService and useSessionStats hook
- Ensure real-time data from Supabase

## SmilePopup Integration Status: ✅ Complete

The SmilePopup functionality is properly integrated:
- Settings stored in Chrome extension storage (appropriate)
- Components properly reference settings
- External window support working
- Image upload functionality integrated
- Auto-close and timing features implemented

## Architecture Decision:

**Keep Chrome Storage for:**
- Extension-specific UI preferences
- Custom images and animations
- Window positioning and behavior
- Privacy and notification settings

**Use Supabase for:**
- User data that needs cross-device sync
- Business logic data (tasks, sessions, quotes)
- User profiles and authentication
- Analytics and reporting data

This hybrid approach is optimal for a Chrome extension that also works as a web app.