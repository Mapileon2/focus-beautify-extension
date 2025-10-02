import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { AuthService } from '@/services/authService'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { 
  Mail, 
  Send, 
  Shield, 
  Zap, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Users,
  Lock
} from 'lucide-react'

export function EmailManagement() {
  const { user } = useAuth()
  const [newEmail, setNewEmail] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [magicLinkEmail, setMagicLinkEmail] = useState('')
  const [loading, setLoading] = useState({
    changeEmail: false,
    inviteUser: false,
    magicLink: false,
    reauthenticate: false
  })

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim()) return

    setLoading(prev => ({ ...prev, changeEmail: true }))
    try {
      const result = await AuthService.changeEmail(newEmail)
      toast.success(result.message)
      setNewEmail('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to change email')
    } finally {
      setLoading(prev => ({ ...prev, changeEmail: false }))
    }
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setLoading(prev => ({ ...prev, inviteUser: true }))
    try {
      const result = await AuthService.inviteUser(inviteEmail)
      toast.success(result.message)
      setInviteEmail('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation')
    } finally {
      setLoading(prev => ({ ...prev, inviteUser: false }))
    }
  }

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!magicLinkEmail.trim()) return

    setLoading(prev => ({ ...prev, magicLink: true }))
    try {
      const result = await AuthService.sendMagicLink(magicLinkEmail)
      toast.success(result.message)
      setMagicLinkEmail('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send magic link')
    } finally {
      setLoading(prev => ({ ...prev, magicLink: false }))
    }
  }

  const handleReauthenticate = async () => {
    setLoading(prev => ({ ...prev, reauthenticate: true }))
    try {
      const result = await AuthService.reauthenticate()
      toast.success(result.message)
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reauthentication email')
    } finally {
      setLoading(prev => ({ ...prev, reauthenticate: false }))
    }
  }

  const handleSignOutEverywhere = async () => {
    try {
      const result = await AuthService.signOutEverywhere()
      toast.success(result.message)
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out from all devices')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Management
          </CardTitle>
          <CardDescription>
            Manage your email settings and authentication options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Email Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Email</h3>
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Mail className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium">{user?.email}</p>
                <p className="text-sm text-muted-foreground">
                  {user?.email_confirmed_at ? 'Verified' : 'Unverified'}
                </p>
              </div>
              {user?.email_confirmed_at ? (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Unverified
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Change Email */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Change Email Address</h3>
            <form onSubmit={handleChangeEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">New Email Address</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading.changeEmail || !newEmail.trim()}
                className="gap-2"
              >
                {loading.changeEmail ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sending Confirmation...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Change Email
                  </>
                )}
              </Button>
            </form>
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                A confirmation email will be sent to your new email address. 
                You'll need to click the link to complete the change.
              </AlertDescription>
            </Alert>
          </div>

          <Separator />

          {/* Magic Link */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Send Magic Link</h3>
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magicLinkEmail">Email Address</Label>
                <Input
                  id="magicLinkEmail"
                  type="email"
                  value={magicLinkEmail}
                  onChange={(e) => setMagicLinkEmail(e.target.value)}
                  placeholder="Enter email for magic link"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading.magicLink || !magicLinkEmail.trim()}
                className="gap-2"
              >
                {loading.magicLink ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sending Magic Link...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Send Magic Link
                  </>
                )}
              </Button>
            </form>
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                Magic links provide passwordless authentication and expire after 5 minutes for security.
              </AlertDescription>
            </Alert>
          </div>

          <Separator />

          {/* Invite User */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Invite User</h3>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email Address to Invite</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email to invite"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading.inviteUser || !inviteEmail.trim()}
                className="gap-2"
              >
                {loading.inviteUser ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sending Invitation...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </form>
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Invitations allow new users to join your Focus Timer team. 
                They'll receive an email with setup instructions.
              </AlertDescription>
            </Alert>
          </div>

          <Separator />

          {/* Security Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Security Actions</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Button 
                onClick={handleReauthenticate}
                disabled={loading.reauthenticate}
                variant="outline"
                className="gap-2"
              >
                {loading.reauthenticate ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Reauthenticate
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleSignOutEverywhere}
                variant="destructive"
                className="gap-2"
              >
                <Lock className="h-4 w-4" />
                Sign Out Everywhere
              </Button>
            </div>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Reauthenticate:</strong> Verify your identity for security-sensitive actions.
                <br />
                <strong>Sign Out Everywhere:</strong> End all active sessions on all devices.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}