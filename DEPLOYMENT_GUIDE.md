# Deployment Guide - Focus Timer Extension with Supabase Backend

## Overview

This guide covers the complete deployment process for the Focus Timer Chrome Extension with integrated Supabase backend.

## Prerequisites

- Supabase account and project
- Chrome browser for testing
- Node.js and npm installed

## Backend Setup (Supabase)

### 1. Database Schema Setup

1. Open your Supabase dashboard: https://sbiykywpmkqhmgzisrez.supabase.co
2. Navigate to the SQL Editor
3. Execute the schema from `supabase-schema.sql`:

```sql
-- Copy and paste the entire contents of supabase-schema.sql
-- This will create all tables, indexes, RLS policies, and sample data
```

### 2. Verify Database Setup

After running the schema, verify these tables exist:
- `users`
- `user_settings`
- `focus_sessions`
- `tasks`
- `quotes`

### 3. Authentication Configuration

1. Go to Authentication > Settings in Supabase
2. Ensure email authentication is enabled
3. Configure email templates if needed
4. Set up any additional auth providers (optional)

## Frontend Configuration

### 1. Environment Setup

The Supabase configuration is already set in `src/lib/supabase.ts`:
- URL: `https://sbiykywpmkqhmgzisrez.supabase.co`
- Anon Key: Already configured

### 2. Build the Extension

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### 3. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from your project

## Testing the Integration

### 1. Backend Status Check

1. Open the extension
2. Navigate to Dashboard
3. Click on "Backend Status" tab
4. Verify all connections show as "Connected" and tables show as "OK"

### 2. Authentication Test

1. Try signing up with a new account
2. Check email for verification (if email verification is enabled)
3. Sign in with the account
4. Verify user profile is created in Supabase dashboard

### 3. Feature Testing

Test each major feature:
- **Focus Sessions**: Start and complete a focus session
- **Tasks**: Create, update, and delete tasks
- **Quotes**: View quotes and create custom ones
- **Settings**: Update user preferences

## Production Deployment

### 1. Chrome Web Store Preparation

1. Update `manifest.json` version number
2. Prepare store assets (icons, screenshots, descriptions)
3. Build final production version:
   ```bash
   npm run build:extension
   ```

### 2. Security Considerations

- Ensure RLS policies are properly configured
- Review API key permissions
- Test with different user accounts
- Verify data isolation between users

### 3. Performance Optimization

- Monitor Supabase usage and performance
- Implement caching strategies if needed
- Optimize database queries
- Consider CDN for static assets

## Monitoring and Maintenance

### 1. Database Monitoring

- Monitor Supabase dashboard for usage metrics
- Set up alerts for high usage or errors
- Regular backup verification

### 2. User Feedback

- Monitor Chrome Web Store reviews
- Set up error tracking (Sentry, etc.)
- Collect user analytics

### 3. Updates and Migrations

- Plan database schema migrations
- Version control for database changes
- Gradual rollout strategy for major updates

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify Supabase URL and API key
   - Check CSP settings in manifest.json
   - Ensure network connectivity

2. **Authentication Issues**
   - Check email verification settings
   - Verify RLS policies
   - Test with different browsers

3. **Data Not Syncing**
   - Check user authentication status
   - Verify RLS policies allow data access
   - Monitor network requests in DevTools

### Debug Tools

1. **Browser DevTools**
   - Network tab for API requests
   - Console for JavaScript errors
   - Application tab for storage inspection

2. **Supabase Dashboard**
   - Real-time logs
   - Database query performance
   - Authentication logs

## Support and Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [React Query Documentation](https://tanstack.com/query/latest)

### Community
- Supabase Discord
- Chrome Extension Developer Community
- React Developer Community

## Backup and Recovery

### Database Backups
- Supabase provides automatic backups
- Consider additional backup strategies for critical data
- Test restore procedures regularly

### Code Backups
- Use version control (Git)
- Tag releases for easy rollback
- Maintain deployment documentation

## Performance Metrics

### Key Metrics to Monitor
- Extension load time
- API response times
- User engagement metrics
- Error rates
- Database performance

### Optimization Strategies
- Implement lazy loading
- Use React Query caching effectively
- Optimize database indexes
- Monitor bundle size

This deployment guide ensures a smooth transition from development to production while maintaining security, performance, and user experience standards.