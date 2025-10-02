# 📧 Supabase Email Services Complete Setup Guide

## 🎯 **Supabase Email Templates Overview**

You have access to these Supabase email templates:
1. **Confirm Signup** - Email confirmation for new users
2. **Invite User** - Team/admin invitations
3. **Magic Link** - Passwordless authentication
4. **Change Email Address** - Email change confirmation
5. **Reset Password** - Password reset functionality
6. **Reauthentication** - Security verification

## 🔧 **Current Implementation Status**

### ✅ **Already Implemented:**
- **Confirm Signup** - Complete with `/confirm-email` page
- **Reset Password** - Enhanced with `/reset-password` page

### 🚀 **Need to Implement:**
- **Invite User** - Team invitation system
- **Magic Link** - Passwordless login
- **Change Email Address** - Email change flow
- **Reauthentication** - Security verification

## 📋 **Supabase Dashboard Configuration**

### **Step 1: Access Email Templates**
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Configure each template with custom content and redirect URLs

### **Step 2: Required Redirect URLs**
Add these to your **Authentication** → **URL Configuration**:
```
Site URL: https://yourdomain.com
Redirect URLs:
- http://localhost:3000/confirm-email
- http://localhost:3000/reset-password
- http://localhost:3000/magic-link
- http://localhost:3000/change-email
- http://localhost:3000/invite-accept
- https://yourdomain.com/confirm-email
- https://yourdomain.com/reset-password
- https://yourdomain.com/magic-link
- https://yourdomain.com/change-email
- https://yourdomain.com/invite-accept
```

## 🎨 **Email Template Configurations**

### **1. Confirm Signup Template**
```html
Subject: Welcome to Focus Timer - Confirm Your Email

<h2>Welcome to Focus Timer!</h2>
<p>Thanks for signing up! Please confirm your email address to get started.</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email Address</a></p>
<p>This link expires in 24 hours.</p>
```

### **2. Reset Password Template**
```html
Subject: Reset Your Focus Timer Password

<h2>Password Reset Request</h2>
<p>We received a request to reset your password.</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, please ignore this email.</p>
<p>This link expires in 1 hour.</p>
```

### **3. Magic Link Template**
```html
Subject: Your Focus Timer Magic Link

<h2>Sign in to Focus Timer</h2>
<p>Click the link below to sign in to your account:</p>
<p><a href="{{ .ConfirmationURL }}">Sign In with Magic Link</a></p>
<p>This link expires in 5 minutes.</p>
```

### **4. Invite User Template**
```html
Subject: You're Invited to Join Focus Timer

<h2>You've Been Invited!</h2>
<p>{{ .InviterName }} has invited you to join their Focus Timer team.</p>
<p><a href="{{ .ConfirmationURL }}">Accept Invitation</a></p>
<p>This invitation expires in 7 days.</p>
```

### **5. Change Email Template**
```html
Subject: Confirm Your New Email Address

<h2>Email Change Request</h2>
<p>Please confirm your new email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm New Email</a></p>
<p>This link expires in 24 hours.</p>
```

### **6. Reauthentication Template**
```html
Subject: Security Verification Required

<h2>Security Check</h2>
<p>For your security, please verify your identity:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Identity</a></p>
<p>This link expires in 10 minutes.</p>
```