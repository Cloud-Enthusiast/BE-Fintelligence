
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
  const { login, loginWithOTP } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpUsername, setOtpUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loginType, setLoginType] = useState<'officer' | 'applicant'>('officer');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(username, password, loginType);
      if (success) {
        navigate(loginType === 'officer' ? '/dashboard' : '/application');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending OTP
    setOtpSent(true);
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await loginWithOTP(otpUsername, otp);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
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
              <BuildingIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-finance-900 text-2xl font-bold text-center">BE Fintelligence</h1>
          <p className="text-finance-600 text-lg">Your partner in funding dreams</p>
        </div>

        <Tabs defaultValue="officer" className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="officer" 
              onClick={() => setLoginType('officer')}
            >
              Loan Officer
            </TabsTrigger>
            <TabsTrigger 
              value="applicant" 
              onClick={() => setLoginType('applicant')}
            >
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
                      <Label htmlFor="username">Email</Label>
                      <div className="relative">
                        <MailIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input 
                          id="username" 
                          type="text" 
                          placeholder={loginType === 'officer' ? 'admin@example.com' : 'user@example.com'} 
                          value={username} 
                          onChange={e => setUsername(e.target.value)} 
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
                  
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-finance-600 hover:text-finance-800 font-medium">
                        Register
                      </Link>
                    </p>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="otp">
                {!otpSent ? (
                  <form onSubmit={handleSendOTP}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="otpUsername">Email</Label>
                        <div className="relative">
                          <MailIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input 
                            id="otpUsername" 
                            type="text" 
                            placeholder={loginType === 'officer' ? 'admin@example.com' : 'user@example.com'} 
                            value={otpUsername} 
                            onChange={e => setOtpUsername(e.target.value)} 
                            className="pl-10" 
                            required 
                          />
                        </div>
                      </div>
                    </div>
                    <Button className="w-full mt-6" type="submit">
                      Send One-Time Password
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
                    <Button variant="ghost" type="button" className="w-full mt-2" onClick={() => setOtpSent(false)}>
                      Try Another Method
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-sm text-muted-foreground text-center mt-2">
              <p>Demo credentials:</p>
              <p>Email: <strong>admin</strong>, Password: <strong>admin</strong> (Officer)</p>
              <p>Email: <strong>user</strong>, Password: <strong>user</strong> (Applicant)</p>
              <p>Email: <strong>Garry</strong>, Password: <strong>Thedevguy</strong> (Officer)</p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
