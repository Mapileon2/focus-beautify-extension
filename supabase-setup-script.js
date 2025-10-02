/**
 * SUPABASE EMAIL SERVICES SETUP SCRIPT
 * Automated setup script for Focus Timer email services
 * 
 * This script helps you configure all email templates and settings
 * Run this in your browser console on the Supabase Dashboard
 */

// Configuration object with all email templates and settings
const FOCUS_TIMER_EMAIL_CONFIG = {
  projectName: "Focus Timer",
  siteUrl: "https://yourdomain.com", // Update this to your domain
  
  // Email templates configuration
  templates: {
    confirm_signup: {
      subject: "Welcome to Focus Timer - Confirm Your Email 🎯",
      redirectTo: "/confirm-email"
    },
    reset_password: {
      subject: "Reset Your Focus Timer Password 🔒", 
      redirectTo: "/reset-password"
    },
    magic_link: {
      subject: "Your Focus Timer Magic Link ✨",
      redirectTo: "/magic-link"
    },
    email_change: {
      subject: "Confirm Your New Email Address 📧",
      redirectTo: "/change-email"
    },
    invite: {
      subject: "You're Invited to Join Focus Timer! 🎯",
      redirectTo: "/invite-accept"
    },
    recovery: {
      subject: "Security Verification Required 🔐",
      redirectTo: "/dashboard"
    }
  },

  // Redirect URLs to whitelist
  redirectUrls: [
    "http://localhost:3000/confirm-email",
    "http://localhost:3000/reset-password",
    "http://localhost:3000/magic-link", 
    "http://localhost:3000/change-email",
    "http://localhost:3000/invite-accept",
    "https://yourdomain.com/confirm-email",
    "https://yourdomain.com/reset-password",
    "https://yourdomain.com/magic-link",
    "https://yourdomain.com/change-email", 
    "https://yourdomain.com/invite-accept"
  ],

  // Authentication settings
  authSettings: {
    enableSignups: true,
    enableEmailConfirmations: true,
    enablePasswordRecovery: true,
    enableMagicLinks: true,
    sessionTimeout: 3600, // 1 hour
    passwordMinLength: 8,
    passwordRequireSymbols: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true
  }
};

/**
 * Setup Instructions Generator
 */
function generateSetupInstructions() {
  console.log(`
🎯 FOCUS TIMER EMAIL SERVICES SETUP GUIDE
==========================================

📧 EMAIL TEMPLATES TO CONFIGURE:
${Object.entries(FOCUS_TIMER_EMAIL_CONFIG.templates).map(([key, config]) => 
  `✅ ${key.toUpperCase()}: "${config.subject}"`
).join('\n')}

🔗 REDIRECT URLS TO ADD:
${FOCUS_TIMER_EMAIL_CONFIG.redirectUrls.map(url => `✅ ${url}`).join('\n')}

📋 SETUP STEPS:
1. Go to Authentication → Email Templates
2. Configure each template with the provided HTML
3. Go to Authentication → URL Configuration  
4. Add all redirect URLs to the whitelist
5. Go to Authentication → Settings
6. Configure SMTP settings (Supabase service or custom)
7. Test each email flow

🚀 READY TO IMPLEMENT!
  `);
}

/**
 * Supabase Dashboard Helper Functions
 */
const SupabaseSetupHelper = {
  
  // Check if we're on Supabase Dashboard
  isSupabaseDashboard() {
    return window.location.hostname.includes('supabase.com') || 
           window.location.hostname.includes('supabase.co');
  },

  // Generate email template HTML
  generateTemplateHTML(templateType) {
    const templates = {
      confirm_signup: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #3b82f6;">
            <h1 style="color: #3b82f6; margin: 0;">🎯 Focus Timer</h1>
          </div>
          <div style="padding: 30px 0;">
            <h2>Welcome to Focus Timer!</h2>
            <p>Thanks for signing up! We're excited to help you boost your productivity.</p>
            <p>Please confirm your email address to get started:</p>
            <p><a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Confirm Email Address</a></p>
            <p><strong>What you'll get:</strong></p>
            <ul>
              <li>🍅 Customizable Pomodoro timer</li>
              <li>📊 Productivity analytics</li>
              <li>🎯 Goal tracking</li>
              <li>💬 AI assistant</li>
            </ul>
            <p><small>This link expires in 24 hours for security.</small></p>
          </div>
        </div>
      `,
      
      reset_password: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #ef4444;">
            <h1 style="color: #ef4444; margin: 0;">🔒 Focus Timer</h1>
          </div>
          <div style="padding: 30px 0;">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your Focus Timer password.</p>
            <p><a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a></p>
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <strong>Security Notice:</strong>
              <ul>
                <li>This link expires in 1 hour</li>
                <li>If you didn't request this, ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
          </div>
        </div>
      `,

      magic_link: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #8b5cf6;">
            <h1 style="color: #8b5cf6; margin: 0;">✨ Focus Timer</h1>
          </div>
          <div style="padding: 30px 0;">
            <h2>Sign in to Focus Timer</h2>
            <p>Click the magic link below to sign in securely - no password required!</p>
            <p><a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">✨ Sign In with Magic Link</a></p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <strong>About Magic Links:</strong>
              <ul>
                <li>🔐 Secure passwordless authentication</li>
                <li>⚡ Quick and convenient</li>
                <li>⏰ Expires in 5 minutes</li>
              </ul>
            </div>
          </div>
        </div>
      `
    };

    return templates[templateType] || '';
  },

  // Copy template to clipboard
  copyTemplate(templateType) {
    const html = this.generateTemplateHTML(templateType);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(html).then(() => {
        console.log(`✅ ${templateType} template copied to clipboard!`);
      });
    } else {
      console.log(`📋 ${templateType} template:`, html);
    }
  },

  // Generate all templates
  generateAllTemplates() {
    const templates = ['confirm_signup', 'reset_password', 'magic_link'];
    templates.forEach(template => {
      console.log(`\n📧 ${template.toUpperCase()} TEMPLATE:`);
      console.log(this.generateTemplateHTML(template));
    });
  },

  // Validate current setup
  validateSetup() {
    console.log('🔍 Validating Supabase setup...');
    
    // Check if on correct page
    if (!this.isSupabaseDashboard()) {
      console.warn('⚠️ Please run this on your Supabase Dashboard');
      return false;
    }

    console.log('✅ Running on Supabase Dashboard');
    return true;
  },

  // Generate configuration checklist
  generateChecklist() {
    console.log(`
🎯 FOCUS TIMER SUPABASE SETUP CHECKLIST
=======================================

📧 EMAIL TEMPLATES (Authentication → Email Templates):
${Object.entries(FOCUS_TIMER_EMAIL_CONFIG.templates).map(([key, config]) => 
  `☐ ${key}: "${config.subject}"`
).join('\n')}

🔗 REDIRECT URLS (Authentication → URL Configuration):
${FOCUS_TIMER_EMAIL_CONFIG.redirectUrls.map(url => `☐ ${url}`).join('\n')}

⚙️ AUTHENTICATION SETTINGS (Authentication → Settings):
☐ Enable email confirmations
☐ Enable password recovery  
☐ Configure SMTP service
☐ Set password requirements
☐ Configure session timeout

🧪 TESTING:
☐ Test signup email confirmation
☐ Test password reset flow
☐ Test magic link authentication
☐ Test email change confirmation
☐ Test user invitation flow
☐ Test reauthentication

🚀 DEPLOYMENT:
☐ Update redirect URLs for production domain
☐ Configure production SMTP service
☐ Test all flows in production
☐ Monitor email delivery rates
    `);
  }
};

/**
 * Main Setup Function
 */
function setupFocusTimerEmails() {
  console.clear();
  console.log('🎯 FOCUS TIMER EMAIL SERVICES SETUP');
  console.log('===================================');
  
  if (!SupabaseSetupHelper.validateSetup()) {
    return;
  }

  // Generate setup instructions
  generateSetupInstructions();
  
  // Generate checklist
  SupabaseSetupHelper.generateChecklist();
  
  // Provide helper functions
  console.log(`
🛠️ HELPER FUNCTIONS AVAILABLE:
- SupabaseSetupHelper.copyTemplate('confirm_signup')
- SupabaseSetupHelper.copyTemplate('reset_password') 
- SupabaseSetupHelper.copyTemplate('magic_link')
- SupabaseSetupHelper.generateAllTemplates()
- SupabaseSetupHelper.generateChecklist()

📋 QUICK COPY COMMANDS:
SupabaseSetupHelper.copyTemplate('confirm_signup');
SupabaseSetupHelper.copyTemplate('reset_password');
SupabaseSetupHelper.copyTemplate('magic_link');
  `);
}

// Auto-run setup if script is loaded
if (typeof window !== 'undefined') {
  setupFocusTimerEmails();
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FOCUS_TIMER_EMAIL_CONFIG,
    SupabaseSetupHelper,
    setupFocusTimerEmails
  };
}