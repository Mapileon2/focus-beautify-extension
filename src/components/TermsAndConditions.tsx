import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, FileText } from 'lucide-react';

interface TermsAndConditionsProps {
  children: React.ReactNode;
}

export function TermsAndConditions({ children }: TermsAndConditionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Terms and Conditions
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700">
                These Terms and Conditions ("Terms") govern your use of the Focus Timer ("Extension", "Application", "we", "our", or "us"). 
                By installing or using this Application, you ("User", "you") agree to these Terms. If you do not agree, do not install or use the Application.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">1. End User License Agreement (EULA)</h3>
              
              <h4 className="font-medium text-gray-800 mb-2">1.1 License Grant</h4>
              <p className="text-gray-700 mb-3">
                We grant you a limited, non-exclusive, non-transferable, revocable license to use the Application for personal or business use in accordance with these Terms.
              </p>

              <h4 className="font-medium text-gray-800 mb-2">1.2 Restrictions</h4>
              <p className="text-gray-700 mb-2">You may not:</p>
              <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                <li>Modify, reverse-engineer, or decompile the Application</li>
                <li>Use the Application for unlawful purposes or in violation of applicable laws</li>
                <li>Resell, sublicense, or distribute the Application without written consent</li>
                <li>Attempt to gain unauthorized access to our systems or other users' data</li>
              </ul>

              <h4 className="font-medium text-gray-800 mb-2">1.3 Termination</h4>
              <p className="text-gray-700 mb-4">
                We may suspend or terminate your access if you violate these Terms. Upon termination, you must uninstall and cease use of the Application.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2. Privacy & GDPR Compliance</h3>
              
              <h4 className="font-medium text-gray-800 mb-2">2.1 Data Collection</h4>
              <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                <li>The Application may collect minimal user data necessary to provide functionality (e.g., preferences, settings, account details, productivity statistics)</li>
                <li>We do not sell or rent personal data to third parties</li>
                <li>Data is used solely to improve your experience and provide the services you request</li>
              </ul>

              <h4 className="font-medium text-gray-800 mb-2">2.2 Legal Basis (GDPR)</h4>
              <p className="text-gray-700 mb-2">Under GDPR, personal data is processed on the basis of:</p>
              <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                <li><strong>Consent</strong> (when you explicitly allow collection, e.g., creating an account)</li>
                <li><strong>Legitimate Interest</strong> (e.g., performance optimization, security)</li>
                <li><strong>Legal Obligation</strong> (when required by law)</li>
              </ul>

              <h4 className="font-medium text-gray-800 mb-2">2.3 User Rights (GDPR)</h4>
              <p className="text-gray-700 mb-2">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                <li>Access, rectify, or delete your personal data</li>
                <li>Withdraw consent at any time</li>
                <li>Request a copy of the data we hold about you</li>
                <li>Lodge a complaint with a supervisory authority</li>
                <li>Data portability (receive your data in a structured format)</li>
              </ul>

              <h4 className="font-medium text-gray-800 mb-2">2.4 Data Storage & Security</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Data is stored in secure servers with industry-standard encryption</li>
                <li>We implement reasonable technical and organizational measures to protect against unauthorized access</li>
                <li>Data retention periods are limited to what is necessary for the purposes collected</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">3. Service Description</h3>
              <p className="text-gray-700 mb-2">Focus Timer provides:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Pomodoro timer functionality for productivity enhancement</li>
                <li>Task management and goal tracking features</li>
                <li>Analytics and insights on productivity patterns</li>
                <li>Cross-device synchronization (for registered users)</li>
                <li>AI-powered productivity coaching and recommendations</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">4. User Accounts</h3>
              <h4 className="font-medium text-gray-800 mb-2">4.1 Account Creation</h4>
              <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
              </ul>

              <h4 className="font-medium text-gray-800 mb-2">4.2 Account Termination</h4>
              <p className="text-gray-700 mb-4">
                You may delete your account at any time through the application settings. Upon deletion, your personal data will be removed in accordance with our privacy policy.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5. Intellectual Property</h3>
              <p className="text-gray-700 mb-4">
                The Application and all associated content (code, design, branding, algorithms) remain our intellectual property. 
                Unauthorized use, copying, or distribution may result in legal action.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">6. Disclaimer of Warranties</h3>
              <p className="text-gray-700 mb-4">
                The Application is provided "as is" and "as available" without warranties of any kind, express or implied. 
                We do not guarantee uninterrupted functionality or that the Application will be error-free.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">7. Limitation of Liability</h3>
              <p className="text-gray-700 mb-4">
                To the maximum extent permitted by law, we are not liable for any damages, including loss of data, revenue, 
                or profits, arising from the use or inability to use the Application.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">8. Third-Party Services</h3>
              <p className="text-gray-700 mb-4">
                The Application may integrate with third-party services (e.g., authentication providers, analytics, cloud storage). 
                We are not responsible for the policies or practices of these services.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">9. Updates & Modifications</h3>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify or update the Application or these Terms at any time. 
                Continued use constitutes acceptance of updated Terms. We will notify users of significant changes.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">10. Governing Law & Jurisdiction</h3>
              <p className="text-gray-700 mb-4">
                These Terms shall be governed by the laws of the jurisdiction where our company is registered. 
                Any disputes shall be resolved through binding arbitration or in the appropriate courts.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">11. Contact Information</h3>
              <p className="text-gray-700 mb-2">
                For questions, requests, or complaints regarding these Terms or GDPR compliance, contact:
              </p>
              <div className="bg-gray-50 p-3 rounded-lg text-gray-700">
                <p><strong>Email:</strong> support@focustimer.app</p>
                <p><strong>Company:</strong> Focus Timer Inc.</p>
                <p><strong>Data Protection Officer:</strong> privacy@focustimer.app</p>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-medium">
                  By using the Application, you acknowledge that you have read, understood, and agree to be bound by these Terms.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Privacy Policy Component
export function PrivacyPolicy({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Privacy Policy
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700">
                This Privacy Policy describes how Focus Timer ("we", "our", or "us") collects, uses, and protects your information when you use our application.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Information We Collect</h3>
              <h4 className="font-medium text-gray-800 mb-2">Account Information</h4>
              <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                <li>Email address (for account creation and communication)</li>
                <li>Name (optional, for personalization)</li>
                <li>Profile preferences and settings</li>
              </ul>

              <h4 className="font-medium text-gray-800 mb-2">Usage Data</h4>
              <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                <li>Timer sessions and productivity statistics</li>
                <li>Task completion data</li>
                <li>Goal progress and achievements</li>
                <li>Application usage patterns (anonymized)</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">How We Use Your Information</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Provide and improve our services</li>
                <li>Sync your data across devices</li>
                <li>Generate productivity insights and recommendations</li>
                <li>Send important service updates (with your consent)</li>
                <li>Ensure security and prevent fraud</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Data Security</h3>
              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your data.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Your Rights</h3>
              <p className="text-gray-700 mb-2">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Access and download your data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Opt-out of communications</li>
                <li>File a complaint with data protection authorities</li>
              </ul>

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  <strong>Contact us:</strong> For privacy-related questions, email privacy@focustimer.app
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}