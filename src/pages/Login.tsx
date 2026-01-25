import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BuildingIcon, ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, user } = useAuth();
  const { toast } = useToast();

  const from = (location.state as any)?.from || '/dashboard';
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate(from, { replace: true });
    return null;
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Could not sign in with Google",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
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
              Sign In
            </CardTitle>
            <CardDescription className="text-center text-finance-600">
              Access your dashboard securely
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 pb-8">
            <Button
              className="w-full h-12 text-md"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Sign in with Google
            </Button>

            <div className="mt-6 text-center text-sm text-gray-500">
              More login options coming soon
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
