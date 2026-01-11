
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
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import { 
  UserIcon, 
  BellIcon, 
  ShieldIcon,
  PaletteIcon,
  DatabaseIcon,
  MailIcon,
  KeyIcon,
  AlertCircleIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const { profile, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [autoApproval, setAutoApproval] = useState(false);
  const [riskThreshold, setRiskThreshold] = useState('medium');

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar isOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          onSidebarToggle={handleSidebarToggle}
        />
        
        <main className={`flex-1 p-4 md:p-6 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account and application preferences</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                    <CardDescription>Update your personal and professional information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={profile?.full_name || ''} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue={profile?.email || ''} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" defaultValue={profile?.phone || ''} placeholder="+1 (555) 123-4567" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" defaultValue="Loan Department" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input id="position" defaultValue="Loan Officer" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employee-id">Employee ID</Label>
                        <Input id="employee-id" placeholder="EMP-12345" />
                      </div>
                    </div>
                    <Button onClick={handleSaveProfile}>Save Profile</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BellIcon className="h-5 w-5" />
                        Notification Preferences
                      </CardTitle>
                      <CardDescription>Choose how you want to be notified about important events</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <Switch 
                          id="email-notifications" 
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                          <p className="text-sm text-gray-500">Receive browser push notifications</p>
                        </div>
                        <Switch 
                          id="push-notifications" 
                          checked={pushNotifications}
                          onCheckedChange={setPushNotifications}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Notification Types</Label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="new-applications" defaultChecked className="rounded" />
                            <Label htmlFor="new-applications">New loan applications</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="risk-alerts" defaultChecked className="rounded" />
                            <Label htmlFor="risk-alerts">Risk alerts</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="system-updates" className="rounded" />
                            <Label htmlFor="system-updates">System updates</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="deadline-reminders" defaultChecked className="rounded" />
                            <Label htmlFor="deadline-reminders">Deadline reminders</Label>
                          </div>
                        </div>
                      </div>
                      <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="security">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShieldIcon className="h-5 w-5" />
                        Security Settings
                      </CardTitle>
                      <CardDescription>Manage your account security and access controls</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Change Password</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <Input type="password" placeholder="Current password" />
                            <Input type="password" placeholder="New password" />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-gray-500">Add an extra layer of security</p>
                          </div>
                          <Button variant="outline">Enable 2FA</Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-logout</Label>
                            <p className="text-sm text-gray-500">Automatically log out after inactivity</p>
                          </div>
                          <Select defaultValue="30">
                            <SelectTrigger className="w-32">
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

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <KeyIcon className="h-5 w-5" />
                        Access Permissions
                      </CardTitle>
                      <CardDescription>Your current access levels and permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm font-medium">Loan Review</span>
                          <span className="text-sm text-green-600">Full Access</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm font-medium">Customer Data</span>
                          <span className="text-sm text-green-600">Read/Write</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <span className="text-sm font-medium">Risk Management</span>
                          <span className="text-sm text-yellow-600">Read Only</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <span className="text-sm font-medium">System Admin</span>
                          <span className="text-sm text-red-600">No Access</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="system">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DatabaseIcon className="h-5 w-5" />
                        System Preferences
                      </CardTitle>
                      <CardDescription>Configure system-wide settings and preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-approval for Low Risk</Label>
                          <p className="text-sm text-gray-500">Automatically approve loans with low risk scores</p>
                        </div>
                        <Switch 
                          checked={autoApproval}
                          onCheckedChange={setAutoApproval}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Default Risk Threshold</Label>
                        <Select value={riskThreshold} onValueChange={setRiskThreshold}>
                          <SelectTrigger>
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
                        <Label>Interface Theme</Label>
                        <Select defaultValue="light">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="auto">Auto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Date Format</Label>
                        <Select defaultValue="mm/dd/yyyy">
                          <SelectTrigger>
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

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircleIcon className="h-5 w-5" />
                        Data & Privacy
                      </CardTitle>
                      <CardDescription>Manage your data and privacy preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button variant="outline" className="w-full">Download My Data</Button>
                      <Button variant="outline" className="w-full">Data Retention Policy</Button>
                      <Button variant="destructive" className="w-full">Delete Account</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
