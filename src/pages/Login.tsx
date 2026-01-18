import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BuildingIcon, KeyIcon, MailIcon, Loader2, ArrowLeft, Zap, AlertTriangle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginDemo, signup } = useAuth();
  const { toast } = useToast();

  const from = (location.state as any)?.from || '/dashboard';

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let success;
      if (isSignUp) {
        success = await signup(email, password, fullName);
      } else {
        success = await login(email, password);
      }

      if (success) {
        navigate(from);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const success = await loginDemo();
      if (success) {
        navigate(from);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-app p-4">
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
          <p className="text-finance-600 text-lg">Loan Officer Portal</p>
        </div>

        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden card-shine">
          <CardHeader className="space-y-1 bg-gradient-to-r from-finance-50 to-finance-100/70 rounded-t-lg border-b border-finance-100">
            <CardTitle className="text-2xl text-center text-finance-900">
              {isSignUp ? "Create Account" : "Sign In"}
            </CardTitle>
            <CardDescription className="text-center text-finance-600">
              {isSignUp ? "Enter your details to create an account" : "Enter your credentials or use demo mode"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <motion.div
              variants={formVariants}
              initial="hidden"
              animate="visible"
              key={isSignUp ? "signup" : "login"}
            >
              {/* Demo Mode Button - Primary action */}
              {!isSignUp && (
                <Button
                  className="w-full mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                  size="lg"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  type="button"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting Demo...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Continue in Demo Mode
                    </>
                  )}
                </Button>
              )}

              {!isSignUp && (
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or sign in with credentials
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handlePasswordAuth}>
                <div className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="fullname">Full Name</Label>
                      <div className="relative">
                        <BuildingIcon className="absolute left-3 top-2.5 h-5 w-5 text-finance-500" />
                        <Input
                          id="fullname"
                          type="text"
                          placeholder="Your Name"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          className="pl-10 border-finance-200 focus:border-finance-500"
                          required={isSignUp}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-2.5 h-5 w-5 text-finance-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="pl-10 border-finance-200 focus:border-finance-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <div className="relative">
                      <KeyIcon className="absolute left-3 top-2.5 h-5 w-5 text-finance-500" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="pl-10 border-finance-200 focus:border-finance-500"
                        required
                      />
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full mt-6 bg-finance-500 hover:bg-finance-600 text-white"
                  type="submit"
                  variant={isSignUp ? "default" : "outline"}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignUp ? "Creating Account..." : "Signing In..."}
                    </>
                  ) : (isSignUp ? "Create Account" : "Sign In")}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-finance-600 hover:text-finance-800 underline underline-offset-4"
                >
                  {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Create one"}
                </button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
