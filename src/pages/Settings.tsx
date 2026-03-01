
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  UserIcon,
  BellIcon,
  ShieldIcon,
  DatabaseIcon,
  KeyIcon,
  AlertCircleIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const { user } = useAuth();

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [autoApproval, setAutoApproval] = useState(false);
  const [riskThreshold, setRiskThreshold] = useState('medium');

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Preferences Updated",
      description: "Your notification settings have been saved.",
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: "Security Settings Updated",
      description: "Your security preferences have been saved.",
    });
  };

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
                    <Input id="email" type="email" defaultValue={user?.email || ''} className="bg-background border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue={user?.phoneNumber || ''} placeholder="+1 (555) 123-4567" className="bg-background border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" defaultValue="Loan Department" className="bg-background border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" defaultValue="Loan Officer" className="bg-background border-border/50" />
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
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div>
                      <Label htmlFor="push-notifications" className="text-foreground">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground mt-1">Receive browser push notifications</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>

                  <div className="space-y-4 pt-2">
                    <Label className="text-foreground">Notification Types</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" id="new-applications" defaultChecked className="rounded border-border text-primary focus:ring-primary h-4 w-4" />
                        <Label htmlFor="new-applications" className="font-normal cursor-pointer">New loan applications</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" id="risk-alerts" defaultChecked className="rounded border-border text-primary focus:ring-primary h-4 w-4" />
                        <Label htmlFor="risk-alerts" className="font-normal cursor-pointer">Risk alerts</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" id="system-updates" className="rounded border-border text-primary focus:ring-primary h-4 w-4" />
                        <Label htmlFor="system-updates" className="font-normal cursor-pointer">System updates</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" id="deadline-reminders" defaultChecked className="rounded border-border text-primary focus:ring-primary h-4 w-4" />
                        <Label htmlFor="deadline-reminders" className="font-normal cursor-pointer">Deadline reminders</Label>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <Label className="text-foreground">Change Password</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <Input type="password" placeholder="Current password" />
                        <Input type="password" placeholder="New password" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div>
                        <Label className="text-foreground">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground mt-1">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" className="shrink-0 bg-background">Enable 2FA</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div>
                        <Label className="text-foreground">Auto-logout</Label>
                        <p className="text-sm text-muted-foreground mt-1">Automatically log out after inactivity</p>
                      </div>
                      <Select defaultValue="30">
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
                  <Button onClick={handleSaveSecurity}>Save Security Settings</Button>
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

          <TabsContent value="system" className="mt-0">
            <div className="space-y-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="bg-muted/20 border-b border-border/50 pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DatabaseIcon className="h-5 w-5 text-primary" />
                    System Preferences
                  </CardTitle>
                  <CardDescription>Configure system-wide settings and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div>
                      <Label className="text-foreground">Auto-approval for Low Risk</Label>
                      <p className="text-sm text-muted-foreground mt-1">Automatically approve loans with low risk scores</p>
                    </div>
                    <Switch
                      checked={autoApproval}
                      onCheckedChange={setAutoApproval}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Default Risk Threshold</Label>
                    <Select value={riskThreshold} onValueChange={setRiskThreshold}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Score &ge; 80)</SelectItem>
                        <SelectItem value="medium">Medium (Score &ge; 60)</SelectItem>
                        <SelectItem value="high">High (Score &ge; 40)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Interface Theme</Label>
                    <Select defaultValue="auto">
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
                    <Select defaultValue="mm/dd/yyyy">
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

                  <Button>Save System Settings</Button>
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
                  <Button variant="outline" className="w-full justify-start text-foreground bg-background hover:bg-muted/50 border-border/50">Download My Data</Button>
                  <Button variant="outline" className="w-full justify-start text-foreground bg-background hover:bg-muted/50 border-border/50">Data Retention Policy</Button>
                  <Button variant="destructive" className="w-full justify-start bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-transparent">Delete Account</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Settings;
