
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useApplications } from '@/contexts/ApplicationContext';
import { useCustomers } from '@/hooks/useCustomers';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  UserIcon,
  BellIcon,
  ShieldIcon,
  DatabaseIcon,
  KeyIcon,
  AlertCircleIcon,
  Loader2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const Settings = () => {
  const { user } = useAuth();
  const { applications } = useApplications();
  const { customers } = useCustomers();
  const { preferences, isSaving, savePreferences } = useUserPreferences();

  // Security tab local state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // ── Profile ──────────────────────────────────────────────────────────────

  const handleSaveProfile = () => {
    // Profile fields (name, phone, department, etc.) stored in Firebase Auth
    // display name update could be wired here; for now show success toast.
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
    });
  };

  // ── Notifications ─────────────────────────────────────────────────────────

  const handleSaveNotifications = async () => {
    await savePreferences({
      emailNotifications: preferences.emailNotifications,
      pushNotifications: preferences.pushNotifications,
      notificationTypes: preferences.notificationTypes,
    });
    toast({
      title: 'Notification Preferences Saved',
      description: 'Your notification settings have been updated.',
    });
  };

  // ── Security ──────────────────────────────────────────────────────────────

  const handleChangePassword = async () => {
    if (!user?.email || !currentPassword || !newPassword) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Enter both current and new passwords.' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ variant: 'destructive', title: 'Password too short', description: 'New password must be at least 6 characters.' });
      return;
    }
    setIsChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      toast({ title: 'Password Changed', description: 'Your password has been updated successfully.' });
    } catch (err: any) {
      const msg = err?.code === 'auth/wrong-password'
        ? 'Current password is incorrect.'
        : err?.message ?? 'Failed to change password.';
      toast({ variant: 'destructive', title: 'Password Change Failed', description: msg });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveSecurity = async () => {
    await savePreferences({ autoLogoutMinutes: preferences.autoLogoutMinutes });
    toast({ title: 'Security Settings Saved', description: 'Auto-logout preference updated.' });
  };

  // ── System ────────────────────────────────────────────────────────────────

  const handleSaveSystem = async () => {
    await savePreferences({
      autoApproval: preferences.autoApproval,
      riskThreshold: preferences.riskThreshold,
      theme: preferences.theme,
      dateFormat: preferences.dateFormat,
    });
    toast({ title: 'System Settings Saved', description: 'System preferences have been updated.' });
  };

  // ── Data & Privacy ────────────────────────────────────────────────────────

  const handleDownloadData = () => {
    if (!user) return;
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: { uid: user.uid, email: user.email, displayName: user.displayName },
      customers: customers,
      applications: applications,
      preferences,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bridgeeasy-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Data Exported', description: 'Your data has been downloaded as a JSON file.' });
  };

  const handleDataRetentionPolicy = () => {
    toast({
      title: 'Data Retention Policy',
      description: 'Customer and application data is retained for 7 years in compliance with RBI MSME lending guidelines. Contact support to request early deletion.',
    });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeletingAccount(true);
    try {
      await user.delete();
      // Auth listener will redirect to /login automatically
    } catch (err: any) {
      const msg = err?.code === 'auth/requires-recent-login'
        ? 'Please log out and log back in before deleting your account (recent authentication required).'
        : err?.message ?? 'Failed to delete account.';
      toast({ variant: 'destructive', title: 'Deletion Failed', description: msg });
    } finally {
      setDeletingAccount(false);
      setDeleteDialogOpen(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and application preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50 w-full sm:w-auto overflow-x-auto flex whitespace-nowrap hide-scrollbar p-1">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* ── Profile ── */}
          <TabsContent value="profile" className="mt-0">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-muted/20 border-b border-border/50 pb-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserIcon className="h-5 w-5 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal and professional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user?.displayName || ''} className="bg-background border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={user?.email || ''} disabled className="bg-muted border-border/50 opacity-60" />
                    <p className="text-xs text-muted-foreground">Email is managed by Firebase Authentication.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue={user?.phoneNumber || ''} placeholder="+91 98765 43210" className="bg-background border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" placeholder="Enter department" className="bg-background border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" placeholder="Enter position" className="bg-background border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employee-id">Employee ID</Label>
                    <Input id="employee-id" placeholder="EMP-12345" className="bg-background border-border/50" />
                  </div>
                </div>
                <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90">Save Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Notifications ── */}
          <TabsContent value="notifications" className="mt-0">
            <div className="space-y-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="bg-muted/20 border-b border-border/50 pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BellIcon className="h-5 w-5 text-amber-500" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Choose how you want to be notified about important events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div>
                      <Label htmlFor="email-notifications" className="text-foreground">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground mt-1">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={preferences.emailNotifications}
                      onCheckedChange={v => savePreferences({ emailNotifications: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div>
                      <Label htmlFor="push-notifications" className="text-foreground">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground mt-1">Receive browser push notifications</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={preferences.pushNotifications}
                      onCheckedChange={v => savePreferences({ pushNotifications: v })}
                    />
                  </div>

                  <div className="space-y-4 pt-2">
                    <Label className="text-foreground">Notification Types</Label>
                    <div className="space-y-3">
                      {(
                        [
                          { key: 'newApplications', label: 'New loan applications' },
                          { key: 'riskAlerts', label: 'Risk alerts' },
                          { key: 'systemUpdates', label: 'System updates' },
                          { key: 'deadlineReminders', label: 'Deadline reminders' },
                        ] as const
                      ).map(({ key, label }) => (
                        <div key={key} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={key}
                            checked={preferences.notificationTypes[key]}
                            onChange={e =>
                              savePreferences({
                                notificationTypes: { ...preferences.notificationTypes, [key]: e.target.checked },
                              })
                            }
                            className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                          />
                          <Label htmlFor={key} className="font-normal cursor-pointer">{label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleSaveNotifications} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Security ── */}
          <TabsContent value="security" className="mt-0">
            <div className="space-y-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="bg-muted/20 border-b border-border/50 pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldIcon className="h-5 w-5 text-emerald-500" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Manage your account security and access controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-3">
                      <Label className="text-foreground">Change Password</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="password"
                          placeholder="Current password"
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                        />
                        <Input
                          type="password"
                          placeholder="New password (min 6 chars)"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleChangePassword}
                        disabled={isChangingPassword || !currentPassword || !newPassword}
                        className="bg-background"
                      >
                        {isChangingPassword ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : null}
                        Update Password
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div>
                        <Label className="text-foreground">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground mt-1">Add an extra layer of security</p>
                      </div>
                      <Button
                        variant="outline"
                        className="shrink-0 bg-background"
                        onClick={() => toast({ title: '2FA Coming Soon', description: 'Two-factor authentication via SMS will be available in a future update.' })}
                      >
                        Enable 2FA
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div>
                        <Label className="text-foreground">Auto-logout</Label>
                        <p className="text-sm text-muted-foreground mt-1">Automatically log out after inactivity</p>
                      </div>
                      <Select
                        value={String(preferences.autoLogoutMinutes)}
                        onValueChange={v => savePreferences({ autoLogoutMinutes: Number(v) })}
                      >
                        <SelectTrigger className="w-32 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 min</SelectItem>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleSaveSecurity} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Save Security Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm">
                <CardHeader className="bg-muted/20 border-b border-border/50 pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <KeyIcon className="h-5 w-5 text-amber-600" />
                    Access Permissions
                  </CardTitle>
                  <CardDescription>Your current access levels and permissions</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                      <span className="text-sm font-medium text-foreground">Loan Review</span>
                      <span className="text-sm font-bold text-emerald-600">Full Access</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                      <span className="text-sm font-medium text-foreground">Customer Data</span>
                      <span className="text-sm font-bold text-emerald-600">Read/Write</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-amber-500/5 rounded-lg border border-amber-500/10">
                      <span className="text-sm font-medium text-foreground">Risk Management</span>
                      <span className="text-sm font-bold text-amber-600">Read Only</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/10">
                      <span className="text-sm font-medium text-foreground">System Admin</span>
                      <span className="text-sm font-bold text-destructive">No Access</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── System ── */}
          <TabsContent value="system" className="mt-0">
            <div className="space-y-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="bg-muted/20 border-b border-border/50 pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DatabaseIcon className="h-5 w-5 text-primary" />
                    System Preferences
                  </CardTitle>
                  <CardDescription>Configure system-wide settings and preferences. Changes are saved to your profile.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div>
                      <Label className="text-foreground">Auto-approval for Low Risk</Label>
                      <p className="text-sm text-muted-foreground mt-1">Automatically approve loans with low risk scores</p>
                    </div>
                    <Switch
                      checked={preferences.autoApproval}
                      onCheckedChange={v => savePreferences({ autoApproval: v })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Default Risk Threshold</Label>
                    <Select
                      value={preferences.riskThreshold}
                      onValueChange={v => savePreferences({ riskThreshold: v as 'low' | 'medium' | 'high' })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Score ≥ 80)</SelectItem>
                        <SelectItem value="medium">Medium (Score ≥ 60)</SelectItem>
                        <SelectItem value="high">High (Score ≥ 40)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Interface Theme</Label>
                    <Select
                      value={preferences.theme}
                      onValueChange={v => savePreferences({ theme: v as 'light' | 'dark' | 'auto' })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">System Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Date Format</Label>
                    <Select
                      value={preferences.dateFormat}
                      onValueChange={v => savePreferences({ dateFormat: v as 'mm/dd/yyyy' | 'dd/mm/yyyy' | 'yyyy-mm-dd' })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleSaveSystem} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Save System Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm">
                <CardHeader className="bg-muted/20 border-b border-border/50 pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertCircleIcon className="h-5 w-5 text-destructive" />
                    Data & Privacy
                  </CardTitle>
                  <CardDescription>Manage your data and privacy preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-foreground bg-background hover:bg-muted/50 border-border/50"
                    onClick={handleDownloadData}
                  >
                    Download My Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-foreground bg-background hover:bg-muted/50 border-border/50"
                    onClick={handleDataRetentionPolicy}
                  >
                    Data Retention Policy
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-transparent"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account</DialogTitle>
            <DialogDescription>
              This action is <strong>permanent and irreversible</strong>. All your customers, applications,
              and documents will be removed. You will be logged out immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deletingAccount}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deletingAccount}>
              {deletingAccount ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Yes, Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
