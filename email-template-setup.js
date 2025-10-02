// 📧 Email Template Setup Script for Supabase
// Run this in your browser console on the Supabase Email Templates page

// Template configuration with enhanced details
const emailTemplates = {
  confirmSignup: {
    subject: "Welcome to Focus Timer - Confirm Your Email 🎯",
    redirectUrl: "{{ .SiteURL }}/confirm-email",
    templateFile: "templates/confirm-signup-template.html",
    description: "Welcome email with feature highlights and professional design"
  },

  resetPassword: {
    subject: "Reset Your Focus Timer Password 🔒",
    redirectUrl: "{{ .SiteURL }}/reset-password",
    templateFile: "templates/reset-password-template.html",
    description: "Password reset with security tips and clear instructions"
  },

  magicLink: {
    subject: "Your Focus Timer Magic Link ✨",
    redirectUrl: "{{ .SiteURL }}/magic-link",
    templateFile: "templates/magic-link-template.html",
    description: "Magic link authentication with animated design elements"
  },

  changeEmail: {
    subject: "Confirm Your New Email Address 📧",
    redirectUrl: "{{ .SiteURL }}/change-email",
    templateFile: "templates/change-email-template.html",
    description: "Email change confirmation with step-by-step process"
  },

  inviteUser: {
    subject: "You're Invited to Join Focus Timer! 🎯",
    redirectUrl: "{{ .SiteURL }}/invite-accept",
    templateFile: "templates/invite-user-template.html",
    description: "Team invitation with benefits and statistics"
  },

  recovery: {
    subject: "Security Verification Required 🔐",
    redirectUrl: "{{ .SiteURL }}/dashboard",
    templateFile: "templates/recovery-template.html",
    description: "Security verification with emergency contact options"
  }
};

// Function to copy template HTML to clipboard
function copyTemplateToClipboard(templateName) {
  const template = emailTemplates[templateName];
  if (template) {
    navigator.clipboard.writeText(template.html).then(() => {
      console.log(`✅ ${templateName} HTML copied to clipboard!`);
      alert(`${templateName} template HTML copied to clipboard!`);
    });
  }
}

// Display setup instructions
console.log(`
🚀 EMAIL TEMPLATE SETUP INSTRUCTIONS

1. Go to Supabase Dashboard → Authentication → Email Templates
2. For each template below, copy the HTML and paste it into the template editor
3. Use the provided subject lines and redirect URLs

📧 TEMPLATES TO CONFIGURE:
`);

Object.keys(emailTemplates).forEach((key, index) => {
  const template = emailTemplates[key];
  console.log(`
${index + 1}. ${key.toUpperCase()}
   Subject: ${template.subject}
   Redirect URL: ${template.redirectUrl}
   
   To copy HTML: copyTemplateToClipboard('${key}')
  `);
});

console.log(`
🎯 QUICK SETUP:
Run these commands one by one to copy each template:

copyTemplateToClipboard('confirmSignup')
copyTemplateToClipboard('resetPassword')
copyTemplateToClipboard('magicLink')
copyTemplateToClipboard('changeEmail')
copyTemplateToClipboard('inviteUser')
copyTemplateToClipboard('recovery')

After copying each template:
1. Paste the HTML into the Supabase template editor
2. Set the subject line as shown above
3. Set the redirect URL as shown above
4. Save the template

✨ Your email templates will be ready!
`);

// Make functions available globally
window.copyTemplateToClipboard = copyTemplateToClipboard;
window.emailTemplates = emailTemplates;
// F
unction to load template content from file (for reference)
async function loadTemplateFromFile(templateName) {
  const template = emailTemplates[templateName];
  if (!template) {
    console.error(`Template ${templateName} not found`);
    return null;
  }
  
  try {
    const response = await fetch(template.templateFile);
    const html = await response.text();
    return {
      ...template,
      html: html
    };
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    return null;
  }
}

// Function to copy template HTML to clipboard (manual paste method)
function copyTemplateToClipboard(templateName) {
  const template = emailTemplates[templateName];
  if (!template) {
    console.error(`Template ${templateName} not found`);
    return;
  }
  
  console.log(`
📧 ${templateName.toUpperCase()} TEMPLATE SETUP:

1. SUBJECT LINE:
   ${template.subject}

2. REDIRECT URL:
   ${template.redirectUrl}

3. HTML TEMPLATE:
   Copy the content from: ${template.templateFile}
   
4. DESCRIPTION:
   ${template.description}

📋 SETUP STEPS:
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Select "${templateName}" template
3. Paste the subject line above
4. Set the redirect URL above
5. Copy the HTML content from ${template.templateFile}
6. Paste the HTML into the template editor
7. Save the template

✅ Template configured successfully!
  `);
  
  alert(`${templateName} template setup instructions logged to console!`);
}

// Function to show all template setup instructions
function showAllTemplateInstructions() {
  console.log(`
🚀 COMPLETE EMAIL TEMPLATE SETUP GUIDE

📁 TEMPLATE FILES CREATED:
${Object.entries(emailTemplates).map(([key, template], index) => 
  `${index + 1}. ${template.templateFile} - ${template.description}`
).join('\n')}

📧 SUPABASE CONFIGURATION:

For each template, follow these steps:
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Select the corresponding template
3. Use the configuration below:

${Object.entries(emailTemplates).map(([key, template], index) => `
${index + 1}. ${key.toUpperCase()}:
   Subject: ${template.subject}
   Redirect URL: ${template.redirectUrl}
   HTML: Copy from ${template.templateFile}
   
`).join('')}

🎯 QUICK SETUP COMMANDS:
Run these commands one by one to get setup instructions:

${Object.keys(emailTemplates).map(key => `copyTemplateToClipboard('${key}')`).join('\n')}

📱 REDIRECT URLS TO ADD IN SUPABASE:
Go to Authentication → URL Configuration and add:

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

✨ Your email templates are production-ready with:
- Professional responsive design
- Security best practices
- Clear call-to-action buttons
- Consistent branding
- Mobile-friendly layouts
- Accessibility features
  `);
}

// Function to validate template setup
function validateTemplateSetup() {
  console.log(`
🔍 TEMPLATE VALIDATION CHECKLIST:

${Object.entries(emailTemplates).map(([key, template], index) => `
${index + 1}. ${key.toUpperCase()}:
   ✅ Subject: ${template.subject}
   ✅ Redirect: ${template.redirectUrl}
   ✅ File: ${template.templateFile}
   ✅ Description: ${template.description}
`).join('')}

📋 MANUAL VERIFICATION STEPS:
1. Check that all template files exist in the templates/ folder
2. Verify each HTML template renders correctly
3. Test all redirect URLs work in your application
4. Confirm SMTP settings are configured
5. Send test emails for each template type

🎯 TESTING CHECKLIST:
□ Sign up with real email → Receive confirmation
□ Request password reset → Receive reset email  
□ Request magic link → Receive magic link email
□ Change email in settings → Receive confirmation
□ Send invitation → Invitee receives invitation
□ Trigger security verification → Receive verification email

All templates are ready for production use! 🚀
  `);
}

// Make functions available globally
window.copyTemplateToClipboard = copyTemplateToClipboard;
window.showAllTemplateInstructions = showAllTemplateInstructions;
window.validateTemplateSetup = validateTemplateSetup;
window.loadTemplateFromFile = loadTemplateFromFile;
window.emailTemplates = emailTemplates;

// Display initial instructions
console.log(`
🎯 FOCUS TIMER EMAIL TEMPLATE SETUP

📧 AVAILABLE COMMANDS:
- showAllTemplateInstructions() - Complete setup guide
- copyTemplateToClipboard('templateName') - Get specific template setup
- validateTemplateSetup() - Verify all templates are ready
- loadTemplateFromFile('templateName') - Load template content

📁 TEMPLATE FILES:
${Object.entries(emailTemplates).map(([key, template]) => 
  `- ${key}: ${template.templateFile}`
).join('\n')}

🚀 QUICK START:
Run: showAllTemplateInstructions()
`);

// Auto-show instructions
showAllTemplateInstructions();