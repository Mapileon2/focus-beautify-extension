# 📧 SMTP Configuration Guide for Focus Timer

## Current Setup Analysis
Based on your screenshot, you need to complete these fields:

### Sender Details
- **Sender email**: `noreply@yourdomain.com` (or your actual domain)
- **Sender name**: `Focus Timer` (this appears in recipient's inbox)

### SMTP Provider Settings

## Option 1: Gmail SMTP (Easy for Testing)
```
Host: smtp.gmail.com
Port: 587
Username: your-gmail@gmail.com
Password: [App Password - not your regular password]
```

**To get Gmail App Password:**
1. Go to Google Account settings
2. Security → 2-Step Verification → App passwords
3. Generate app password for "Mail"
4. Use that 16-character password

## Option 2: SendGrid (Recommended for Production)
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [Your SendGrid API Key]
```

## Option 3: Mailgun
```
Host: smtp.mailgun.org
Port: 587
Username: [Your Mailgun SMTP username]
Password: [Your Mailgun SMTP password]
```

## Option 4: Amazon SES
```
Host: email-smtp.us-east-1.amazonaws.com
Port: 587
Username: [Your SES SMTP username]
Password: [Your SES SMTP password]
```

## Recommended Settings for Your Current Form:
```
Sender email: noreply@focustimer.app
Sender name: Focus Timer
Host: smtp.gmail.com (for testing)
Port: 587
Username: your-email@gmail.com
Password: [Gmail App Password]
Minimum interval: 60 seconds (keep as is)
```