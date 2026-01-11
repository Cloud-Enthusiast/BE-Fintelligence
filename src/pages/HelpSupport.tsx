
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import { 
  HelpCircleIcon, 
  BookOpenIcon, 
  MessageSquareIcon,
  PhoneIcon,
  MailIcon,
  VideoIcon,
  FileTextIcon,
  SearchIcon,
  ExternalLinkIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const HelpSupport = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSubmitTicket = () => {
    toast({
      title: "Support Ticket Submitted",
      description: "We'll get back to you within 24 hours.",
    });
  };

  const faqItems = [
    {
      question: "How do I review a loan application?",
      answer: "Navigate to the Applications page from the dashboard, select the application you want to review, and click 'Review Application'. You'll be able to see all applicant details, risk assessment, and make approval decisions."
    },
    {
      question: "What do the risk scores mean?",
      answer: "Risk scores range from 0-100. Scores 80+ are low risk (green), 60-79 are medium risk (yellow), and below 60 are high risk (red). These scores are calculated based on credit history, business financials, and other factors."
    },
    {
      question: "How can I filter applications by status?",
      answer: "On the Applications page, use the tabs at the top to filter by Pending, Approved, or Rejected status. You can also use the search bar to find specific applications by business name or application ID."
    },
    {
      question: "Can I modify risk thresholds?",
      answer: "Yes, you can adjust risk thresholds in the Settings page under System preferences. However, changes may require administrator approval depending on your permission level."
    },
    {
      question: "How do I generate reports?",
      answer: "Visit the Analytics page to access various reports including loan performance, risk analysis, and portfolio metrics. You can export reports as PDF or CSV files."
    },
    {
      question: "What should I do if I encounter technical issues?",
      answer: "First, try refreshing the page or logging out and back in. If the issue persists, submit a support ticket using the form below or contact our technical support team directly."
    }
  ];

  const filteredFAQs = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
              <p className="text-gray-600">Get help and find answers to common questions</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <BookOpenIcon className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold mb-2">User Guide</h3>
                  <p className="text-sm text-gray-600 mb-3">Complete documentation and tutorials</p>
                  <Button variant="outline" size="sm">
                    <ExternalLinkIcon className="h-4 w-4 mr-1" />
                    View Guide
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <VideoIcon className="h-8 w-8 mx-auto mb-3 text-green-600" />
                  <h3 className="font-semibold mb-2">Video Tutorials</h3>
                  <p className="text-sm text-gray-600 mb-3">Step-by-step video walkthroughs</p>
                  <Button variant="outline" size="sm">
                    <ExternalLinkIcon className="h-4 w-4 mr-1" />
                    Watch Videos
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <MessageSquareIcon className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold mb-2">Live Chat</h3>
                  <p className="text-sm text-gray-600 mb-3">Chat with our support team</p>
                  <Button variant="outline" size="sm">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* FAQ Section */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircleIcon className="h-5 w-5" />
                      Frequently Asked Questions
                    </CardTitle>
                    <CardDescription>Find quick answers to common questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search FAQs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <Accordion type="single" collapsible className="space-y-2">
                      {filteredFAQs.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                          <AccordionTrigger className="text-left">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    
                    {filteredFAQs.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <HelpCircleIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No FAQs found matching your search.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Contact Support */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Support</CardTitle>
                    <CardDescription>Get in touch with our support team</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <PhoneIcon className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Phone Support</p>
                        <p className="text-sm text-gray-600">1-800-FINANCE (24/7)</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <MailIcon className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Email Support</p>
                        <p className="text-sm text-gray-600">support@befinance.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <MessageSquareIcon className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Live Chat</p>
                        <p className="text-sm text-gray-600">Available 9 AM - 6 PM EST</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Submit Support Ticket</CardTitle>
                    <CardDescription>Describe your issue and we'll help you resolve it</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="Brief description of your issue" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <select id="priority" className="w-full p-2 border rounded-md">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Critical</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <select id="category" className="w-full p-2 border rounded-md">
                        <option>Technical Issue</option>
                        <option>Account Problem</option>
                        <option>Feature Request</option>
                        <option>Training</option>
                        <option>Other</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Please provide detailed information about your issue..."
                        rows={4}
                      />
                    </div>
                    
                    <Button onClick={handleSubmitTicket} className="w-full">
                      Submit Ticket
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>Current status of our services</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Loan Processing System</span>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Services</span>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Authentication System</span>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Notification Services</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default HelpSupport;
