
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { BuildingIcon, KeyIcon, MailIcon, UserIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const {
    login,
    loginWithOTP,
    isLoading,
    isAuthenticated,
    profile
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loginType, setLoginType] = useState<'officer' | 'applicant'>('officer');

  // If already authenticated, redirect to appropriate page
  if (isAuthenticated && profile) {
    const redirectPath = profile.role === 'Loan Officer' ? '/dashboard' : '/application';
    navigate(redirectPath, { replace: true });
    return null;
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: "Please enter both email and password",
      });
      return;
    }

    const success = await login(email, password);
    if (success) {
      // Auth context will handle the redirect
    }
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: "Please enter your email",
      });
      return;
    }
    
    // In a real implementation, this would call an API to send OTP
    // For demo, just simulate OTP sending
    toast({
      title: "OTP Sent",
      description: "A 6-digit code has been sent to your email",
    });
    setOtpSent(true);
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail || !otp || otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: "Please enter a valid 6-digit OTP",
      });
      return;
    }
    
    const success = await loginWithOTP(otpEmail, otp);
    if (success) {
      // Auth context will handle the redirect
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <div className="bg-finance-600 rounded-lg p-2 shadow-lg">
              <BuildingIcon className="h-8 w-8 text-white bg-blue-950" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-finance-900 mx-0 px-0 py-0 my-0">BE Fintelligence</h1>
          <p className="text-finance-600">Commercial Loan Platform</p>
        </div>

        <Tabs defaultValue="officer" className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="officer" onClick={() => setLoginType('officer')}>
              Loan Officer
            </TabsTrigger>
            <TabsTrigger value="applicant" onClick={() => setLoginType('applicant')}>
              Loan Applicant
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {loginType === 'officer' ? 'Officer Login' : 'Applicant Login'}
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="otp">OTP</TabsTrigger>
              </TabsList>

              <TabsContent value="password">
                <form onSubmit={handlePasswordLogin}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <MailIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder={loginType === 'officer' ? 'admin@example.com' : 'user@example.com'} 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          className="pl-10" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <a href="#" className="text-sm text-finance-600 hover:text-finance-800">
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative">
                        <KeyIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="••••••" 
                          value={password} 
                          onChange={e => setPassword(e.target.value)} 
                          className="pl-10" 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                  
                  {loginType === 'applicant' && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/register')}>
                          Register
                        </Button>
                      </p>
                    </div>
                  )}
                </form>
              </TabsContent>

              <TabsContent value="otp">
                {!otpSent ? (
                  <form onSubmit={handleSendOTP}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="otpEmail">Email</Label>
                        <div className="relative">
                          <MailIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input 
                            id="otpEmail" 
                            type="email" 
                            placeholder={loginType === 'officer' ? 'admin@example.com' : 'user@example.com'} 
                            value={otpEmail} 
                            onChange={e => setOtpEmail(e.target.value)} 
                            className="pl-10" 
                            required 
                          />
                        </div>
                      </div>
                    </div>
                    <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                      {isLoading ? "Sending..." : "Send One-Time Password"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleOTPLogin}>
                    <div className="space-y-4">
                      <div className="space-y-2 text-center">
                        <Label htmlFor="otp">Enter One-Time Password</Label>
                        <p className="text-sm text-muted-foreground mb-4">
                          We've sent a 6-digit code to your email
                        </p>
                        <div className="flex justify-center">
                          <InputOTP 
                            maxLength={6} 
                            value={otp} 
                            onChange={setOtp} 
                            render={({ slots }) => (
                              <InputOTPGroup>
                                {slots.map((slot, index) => (
                                  <InputOTPSlot key={index} {...slot} index={index} />
                                ))}
                              </InputOTPGroup>
                            )} 
                          />
                        </div>
                      </div>
                    </div>
                    <Button className="w-full mt-6" type="submit" disabled={isLoading || otp.length !== 6}>
                      {isLoading ? "Verifying..." : "Verify & Sign In"}
                    </Button>
                    <Button 
                      variant="ghost" 
                      type="button" 
                      className="w-full mt-2" 
                      onClick={() => setOtpSent(false)}
                      disabled={isLoading}
                    >
                      Try Another Method
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-sm text-muted-foreground text-center mt-2">
              {loginType === 'officer' ? (
                <span>Demo credentials: Email: admin@example.com, Password: admin123</span>
              ) : (
                <span>Demo credentials: Email: user@example.com, Password: user123</span>
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
