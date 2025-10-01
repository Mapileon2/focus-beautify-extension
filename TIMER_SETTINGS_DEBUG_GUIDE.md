# 🔍 Timer Settings Debug Guide

## 🚨 **Issue: "Failed to save settings. Please try again."**

This error typically occurs when the database schema hasn't been set up yet. Here's how to diagnose and fix it:

## 🧪 **Step 1: Use the Debug Tool**

1. **Open the timer settings** (click the settings icon)
2. **Click "🔍 Debug Connection"** button at the bottom
3. **Check the console** for detailed error information
4. **Look at the toast message** for the specific issue

## 🔧 **Common Issues & Solutions**

### **Issue 1: Database Schema Not Set Up**
**Error**: `relation "user_settings" does not exist`
**Solution**: 
1. Go to your Supabase dashboard: https://sbiykywpmkqhmgzisrez.supabase.co
2. Navigate to SQL Editor
3. Execute the contents of `supabase-schema.sql`

### **Issue 2: User Not Logged In**
**Error**: No specific error, but settings don't persist
**Solution**: 
- Settings will save to localStorage automatically
- Login to save to your account permanently

### **Issue 3: Permission Issues**
**Error**: `permission denied` or `PGRST301`
**Solution**: 
- Database RLS policies may not be set up correctly
- Re-run the database schema setup

### **Issue 4: Network Issues**
**Error**: `network error` or connection timeout
**Solution**: 
- Check internet connection
- Settings will save locally and sync when online

## 🎯 **Quick Fix: Force Local Storage**

If database issues persist, the settings will automatically fall back to localStorage:

```typescript
// Settings are saved locally regardless of database status
localStorage.setItem('timer_settings', JSON.stringify({
  focusTime: 25,
  breakTime: 5,
  longBreakTime: 15,
  sessionsUntilLongBreak: 4
}));
```

## 🔍 **Debug Information**

The debug tool will show:
1. ✅ **Supabase Connection**: Can connect to database
2. ✅ **Table Access**: user_settings table exists and is accessible
3. ✅ **Authentication**: User login status
4. ✅ **Settings Read**: Can read existing settings
5. ✅ **Settings Write**: Can save new settings

## 🚀 **Expected Behavior**

### **With Database Setup**
- Settings save to your account
- Sync across devices
- Persist permanently

### **Without Database Setup**
- Settings save to localStorage
- Work on current device only
- Persist until browser data is cleared

## 🛠️ **Manual Database Setup**

If you need to set up the database manually:

1. **Go to Supabase Dashboard**
2. **SQL Editor** → **New Query**
3. **Paste this minimal schema**:

```sql
-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    focus_duration INTEGER DEFAULT 25,
    short_break_duration INTEGER DEFAULT 5,
    long_break_duration INTEGER DEFAULT 15,
    sessions_until_long_break INTEGER DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own settings
CREATE POLICY "Users can manage their own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);
```

4. **Run the query**
5. **Test the settings again**

## 📊 **Debug Console Commands**

You can also run these in the browser console:

```javascript
// Test database connection
await debugTimerSettings();

// Check current settings
localStorage.getItem('timer_settings');

// Manually set settings
localStorage.setItem('timer_settings', JSON.stringify({
  focusTime: 30,
  breakTime: 10,
  longBreakTime: 20,
  sessionsUntilLongBreak: 3
}));
```

## ✅ **Success Indicators**

When working correctly, you should see:
- ✅ "Timer settings saved to your account!" (if logged in)
- ✅ "Timer settings updated! (Login to save permanently)" (if not logged in)
- ✅ Settings persist after page refresh
- ✅ Timer duration changes immediately

## 🎯 **Next Steps**

1. **Try the debug tool** to identify the specific issue
2. **Set up the database** if schema is missing
3. **Login to your account** for permanent storage
4. **Settings will work locally** regardless of database status

The timer settings are designed to work in all scenarios - they'll never completely fail to save!