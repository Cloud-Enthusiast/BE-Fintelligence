
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { BuildingIcon, KeyIcon, MailIcon, UserIcon, Loader2, ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithOTP } = useAuth();
  const { toast } = useToast();

  const from = (location.state as any)?.from;
  const defaultTab = (location.state as any)?.defaultTab || 'officer';
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpUsername, setOtpUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loginType, setLoginType] = useState<'officer' | 'applicant'>(defaultTab as 'officer' | 'applicant');
  const [showOTPMethod, setShowOTPMethod] = useState(false);
  
  // Set the login type when the defaultTab changes
  useEffect(() => {
    if (defaultTab) {
      setLoginType(defaultTab as 'officer' | 'applicant');
    }
  }, [defaultTab]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(username, password, loginType);
      if (success) {
        const defaultPath = loginType === 'officer' ? '/dashboard' : '/application';
        navigate(from || defaultPath);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: otpUsername,
        options: {
        }
      });

      if (error) throw error;

      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "Check your email for the one-time password.",
      });

    } catch (error: any) {
      console.error("Send OTP error:", error);
      toast({
        variant: "destructive",
        title: "Failed to Send OTP",
        description: error.message || "Could not send OTP. Please check the email and try again.",
      });
      setOtpSent(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await loginWithOTP(otpUsername, otp);
      if (success) {
        navigate(from || '/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut" 
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.4
      }
    }
  };

  return <div className="min-h-screen flex items-center justify-center bg-gradient-app p-4">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="w-full max-w-md"
      >
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 bg-white/50 backdrop-blur-sm hover:bg-white/70"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <div className="bg-finance-500 rounded-lg p-2 shadow-lg">
              <BuildingIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-finance-900 text-2xl font-bold text-center">BE Finance</h1>
          <p className="text-finance-600 text-lg">Your partner in funding dreams</p>
        </div>

        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden card-shine">
          <CardHeader className="space-y-1 bg-gradient-to-r from-finance-50 to-finance-100/70 rounded-t-lg border-b border-finance-100">
            <CardTitle className="text-2xl text-center text-finance-900">
              {loginType === 'officer' ? 'Loan Officer Login' : 'Applicant Login'}
            </CardTitle>
            <CardDescription className="text-center text-finance-600">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <motion.div
              variants={formVariants}
              initial="hidden"
              animate="visible"
            >
              {!showOTPMethod ? (
                <form onSubmit={handlePasswordLogin}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-finance-500" />
                        <Input id="username" type="text" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} className="pl-10 border-finance-200 focus:border-finance-500" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <a href="#" className="text-sm text-finance-500 hover:text-finance-700 transition-colors">
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative">
                        <KeyIcon className="absolute left-3 top-2.5 h-5 w-5 text-finance-500" />
                        <Input id="password" type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 border-finance-200 focus:border-finance-500" required />
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-finance-500 hover:bg-finance-600 text-white" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : "Sign In"}
                  </Button>
                  
                  {loginType === 'applicant' && <div className="mt-4 text-center">
                      <p className="text-sm text-finance-600">
                        Don't have an account?{' '}
                        <Button variant="link" className="p-0 h-auto text-finance-500 hover:text-finance-700" onClick={() => navigate('/register')}>
                          Register
                        </Button>
                      </p>
                    </div>}
                    
                  <div className="mt-4 text-center">
                    <Button variant="link" className="text-sm text-finance-500 hover:text-finance-700" onClick={() => setShowOTPMethod(true)}>
                      Login with One-Time Password
                    </Button>
                  </div>
                </form>
              ) : !otpSent ? (
                <form onSubmit={handleSendOTP}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otpUsername">Email Address</Label>
                      <div className="relative">
                        <MailIcon className="absolute left-3 top-2.5 h-5 w-5 text-finance-500" />
                        <Input id="otpUsername" type="email" placeholder="your.email@example.com" value={otpUsername} onChange={e => setOtpUsername(e.target.value)} className="pl-10 border-finance-200 focus:border-finance-500" required />
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-finance-500 hover:bg-finance-600 text-white" type="submit" disabled={isLoading}>
                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Sending..." : "Send One-Time Password"}
                  </Button>
                  <Button variant="ghost" type="button" className="w-full mt-2 text-finance-600 hover:bg-finance-50" onClick={() => setShowOTPMethod(false)}>
                    Back to Password Login
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOTPLogin}>
                  <div className="space-y-4">
                    <div className="space-y-2 text-center">
                      <Label htmlFor="otp">Enter One-Time Password</Label>
                      <p className="text-sm text-finance-600 mb-4">
                        We've sent a 6-digit code to your email
                      </p>
                      <div className="flex justify-center">
                        <InputOTP maxLength={6} value={otp} onChange={setOtp} render={({
                      slots
                    }) => <InputOTPGroup>
                              {slots.map((slot, index) => <InputOTPSlot key={index} {...slot} index={index} />)}
                            </InputOTPGroup>} />
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-finance-500 hover:bg-finance-600 text-white" type="submit" disabled={isLoading || otp.length !== 6}>
                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Verifying..." : "Verify & Sign In"}
                  </Button>
                  <Button variant="ghost" type="button" className="w-full mt-2 text-finance-600 hover:bg-finance-50" onClick={() => { setOtpSent(false); setOtp(''); setShowOTPMethod(false); }}>
                    Try Another Method
                  </Button>
                </form>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>;
};

export default Login;
