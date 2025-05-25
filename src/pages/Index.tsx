
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import EligibilityForm from '@/components/EligibilityForm';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, TrendingUp, ShieldCheck, ChevronRight, ArrowRight, Hexagon, Star, CircleDashed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="relative max-w-5xl mx-auto py-12 px-4 space-y-16">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-300/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl -z-10"></div>
        
        {/* Decorative Shapes on right hand side */}
        <motion.div 
          className="absolute right-0 top-40 -z-10 h-full pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div 
            className="absolute right-10 top-0"
            animate={{ 
              rotate: 360,
              y: [0, 10, 0]
            }} 
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              y: { duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
            }}
          >
            <CircleDashed className="h-16 w-16 text-purple-300/40" />
          </motion.div>
          
          <motion.div 
            className="absolute right-40 top-40"
            animate={{ 
              rotate: -360,
              scale: [0.9, 1.1, 0.9]
            }} 
            transition={{ 
              rotate: { duration: 25, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
            }}
          >
            <Hexagon className="h-20 w-20 text-purple-400/30" />
          </motion.div>
          
          <motion.div 
            className="absolute right-20 top-80"
            animate={{ 
              rotate: [0, 10, 0, -10, 0],
              scale: [1, 1.2, 1]
            }} 
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              repeatType: "reverse", 
              ease: "easeInOut" 
            }}
          >
            <Star className="h-12 w-12 text-purple-300/40" />
          </motion.div>
          
          {/* Abstract line drawings */}
          <svg className="absolute right-0 top-20 h-64 w-64 -z-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path 
              d="M10,50 Q30,20 50,50 T90,50" 
              stroke="rgba(155, 135, 245, 0.2)" 
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "loop", repeatDelay: 2 }}
            />
          </svg>
          
          <svg className="absolute right-40 top-60 h-64 w-64 -z-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path 
              d="M10,30 Q50,10 50,50 Q50,90 90,70" 
              stroke="rgba(155, 135, 245, 0.2)" 
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "loop", repeatDelay: 1 }}
            />
          </svg>
        </motion.div>
        
        {/* Diagonal accent lines */}
        <div className="absolute -top-10 -left-10 w-40 h-40">
          <div className="absolute h-[1px] w-60 bg-gradient-to-r from-purple-500/30 to-transparent transform rotate-45"></div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40">
          <div className="absolute h-[1px] w-60 bg-gradient-to-l from-purple-500/40 to-transparent transform rotate-45"></div>
        </div>
        
        {/* Premium corner embellishments */}
        <div className="absolute -top-4 -left-4 w-28 h-28 border-l-2 border-t-2 border-purple-400/50 rounded-tl-xl"></div>
        <div className="absolute -bottom-4 -right-4 w-28 h-28 border-r-2 border-b-2 border-purple-300/70 rounded-br-xl"></div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-8"
        >
          <div className="inline-block mb-2 relative">
            <Badge variant="secondary" className="px-6 py-1.5 text-base bg-gradient-to-r from-purple-500/90 to-purple-600 text-white">
              <span className="mr-2">✦</span> Premium Finance <span className="ml-2">✦</span>
            </Badge>
            <div className="absolute -bottom-1 -left-1 -right-1 h-[3px] bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-purple-900 relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-800 via-purple-900 to-purple-800">
              Commercial Loan Eligibility
            </span>
            <div className="absolute -bottom-3 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
            <motion.span 
              className="absolute -top-6 right-0 text-purple-400"
              animate={{ 
                y: [0, -5, 0],
                scale: [1, 1.2, 1],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Sparkles className="h-7 w-7" />
            </motion.span>
          </h1>
          
          <p className="text-xl md:text-2xl text-purple-700 max-w-3xl mx-auto leading-relaxed">
            Welcome, <span className="font-semibold text-purple-900 border-b-2 border-purple-300">{user?.name || 'Valued Client'}</span>! 
            Discover if your business qualifies for our exclusive commercial loan products.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            <Button 
              variant="ghost" 
              className="group text-purple-700 hover:text-purple-800 hover:bg-purple-50 border-2 border-purple-200 shadow-sm hover:border-purple-300 px-8 py-6 text-lg"
            >
              Learn More
              <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 border-b-4 border-purple-800 px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
        
        {/* Premium features cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10"
        >
          <PremiumFeatureCard 
            icon={<TrendingUp className="h-7 w-7 text-purple-600" />}
            title="Elite Rates"
            description="Access industry-leading rates tailored specifically to your business needs"
          />
          
          <PremiumFeatureCard 
            icon={<ShieldCheck className="h-7 w-7 text-purple-600" />}
            title="Secure Process"
            description="Your information is safeguarded with enterprise-grade security protocols"
            highlight={true}
          />
          
          <PremiumFeatureCard 
            icon={<Sparkles className="h-7 w-7 text-purple-600" />}
            title="Rapid Approval"
            description="Streamlined evaluation with decisions in as little as 48 hours"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative pt-16"
        >
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-[200px] h-[1px] bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
          
          {/* Eligibility form header */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-100 to-purple-50 px-8 py-3 rounded-full border-2 border-purple-200 shadow-lg z-10">
            <span className="text-purple-900 font-bold flex items-center text-lg">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
              Eligibility Check
              <span className="w-2 h-2 bg-purple-400 rounded-full ml-3"></span>
            </span>
          </div>
          
          <Card className="overflow-hidden border-0 shadow-2xl">
            {/* Purple accent top border */}
            <div className="h-1.5 w-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-400"></div>
            
            <CardContent className="p-0">
              <div className="bg-gradient-to-b from-purple-50 to-white p-10 rounded-b-xl">
                <EligibilityForm />
              </div>
            </CardContent>
          </Card>
          
          {/* Purple corner accents */}
          <div className="absolute -bottom-3 -right-3 w-16 h-16 border-r-4 border-b-4 border-purple-300/50 rounded-br-xl z-10"></div>
          <div className="absolute -bottom-3 -left-3 w-16 h-16 border-l-4 border-b-4 border-purple-400/30 rounded-bl-xl z-10"></div>
        </motion.div>
      </div>
    </Layout>
  );
};

const PremiumFeatureCard = ({ icon, title, description, highlight = false }) => {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-xl ${
        highlight 
          ? 'bg-gradient-to-br from-purple-50 to-white border border-purple-200' 
          : 'bg-white/90 backdrop-blur-sm border border-purple-100'
      } shadow-lg hover:shadow-xl transition-all duration-300 p-8 group`}
    >
      {/* Purple corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-10 h-10 bg-purple-300/60 rotate-45 transform origin-bottom-left"></div>
      </div>
      
      <div className={`rounded-full w-16 h-16 flex items-center justify-center mb-6 ${
        highlight 
          ? 'bg-gradient-to-br from-purple-100 to-purple-200 ring-4 ring-purple-50'
          : 'bg-purple-50 group-hover:bg-purple-100 transition-colors'
      }`}>
        {icon}
      </div>
      
      <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center">
        {title}
        {highlight && (
          <span className="ml-2">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
          </span>
        )}
      </h3>
      
      <p className="text-purple-700">
        {description}
      </p>
      
      {/* Purple accent line */}
      {highlight && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
      )}
    </motion.div>
  )
};

export default Index;
