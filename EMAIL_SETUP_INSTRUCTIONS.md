# 🚀 Quick Email Setup Instructions

## Step 1: Complete SMTP Configuration (Your Current Screen)

Fill in these values in your Supabase SMTP form:

### For Testing (Gmail):
```
Sender email: noreply@yourdomain.com
Sender name: Focus Timer
Host: smtp.gmail.com
Port: 587
Username: your-gmail@gmail.com
Password: [Gmail App Password]
```

### For Production (SendGrid - Recommended):
```
Sender email: noreply@yourdomain.com
Sender name: Focus Timer
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [Your SendGrid API Key]
```

## Step 2: Set Up Email Templates

1. **Save your SMTP settings first**
2. **Go to Authentication → Email Templates**
3. **Open browser console (F12)**
4. **Copy and paste the entire `email-template-setup.js` file**
5. **Run these commands one by one:**

```javascript
copyTemplateToClipboard('confirmSignup')
// Paste into "Confirm signup" template

copyTemplateToClipboard('resetPassword')
// Paste into "Reset password" template

copyTemplateToClipboard('magicLink')
// Paste into "Magic Link" template

copyTemplateToClipboard('changeEmail')
// Paste into "Change email address" template

copyTemplateToClipboard('inviteUser')
// Paste into "Invite user" template

copyTemplateToClipboard('recovery')
// Paste into "Recovery" template
```

## Step 3: Configure Redirect URLs

Go to **Authentication → URL Configuration** and add:

```
Site URL: https://yourdomain.com

Redirect URLs:
http://localhost:3000/confirm-email
http://localhost:3000/reset-password
http://localhost:3000/magic-link
http://localhost:3000/change-email
http://localhost:3000/invite-accept
https://yourdomain.com/confirm-email
https://yourdomain.com/reset-password
https://yourdomain.com/magic-link
https://yourdomain.com/change-email
https://yourdomain.com/invite-accept
```

## Step 4: Run Database Setup

In **SQL Editor**, run the `supabase-email-setup.sql` file to create the email logging and analytics tables.

## Step 5: Test Your Setup

Use the `EmailFunctionalityTest` component in your app to verify everything works.

## 🎯 Template Details

Each template includes:
- ✅ **Professional design** with Focus Timer branding
- ✅ **Responsive layout** for all devices
- ✅ **Security messaging** and expiration notices
- ✅ **Clear call-to-action** buttons
- ✅ **Consistent styling** across all emails

## 🔧 Subject Lines & Redirect URLs

| Template | Subject | Redirect URL |
|----------|---------|--------------|
| Confirm Signup | Welcome to Focus Timer - Confirm Your Email 🎯 | /confirm-email |
| Reset Password | Reset Your Focus Timer Password 🔒 | /reset-password |
| Magic Link | Your Focus Timer Magic Link ✨ | /magic-link |
| Change Email | Confirm Your New Email Address 📧 | /change-email |
| Invite User | You're Invited to Join Focus Timer! 🎯 | /invite-accept |
| Recovery | Security Verification Required 🔐 | /dashboard |

Your email system will be production-ready after these steps! 🚀