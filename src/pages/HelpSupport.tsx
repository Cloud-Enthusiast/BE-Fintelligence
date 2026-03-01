
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
import {
  HelpCircleIcon,
  BookOpenIcon,
  MessageSquareIcon,
  PhoneIcon,
  MailIcon,
  VideoIcon,
  SearchIcon,
  ExternalLinkIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const HelpSupport = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="space-y-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Help & Support</h1>
          <p className="text-muted-foreground mt-1">Get help and find answers to common questions</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/50 group border-border/50">
            <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
              <div className="rounded-full bg-primary/10 p-4 mb-4 group-hover:bg-primary/20 transition-colors">
                <BookOpenIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-lg">User Guide</h3>
              <p className="text-sm text-muted-foreground mb-6">Complete documentation and tutorials</p>
              <Button variant="outline" size="sm" className="w-full bg-background shadow-sm group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                View Guide
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow hover:border-emerald-500/50 group border-border/50">
            <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
              <div className="rounded-full bg-emerald-500/10 p-4 mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <VideoIcon className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-lg">Video Tutorials</h3>
              <p className="text-sm text-muted-foreground mb-6">Step-by-step video walkthroughs</p>
              <Button variant="outline" size="sm" className="w-full bg-background shadow-sm group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors">
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                Watch Videos
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow hover:border-amber-500/50 group border-border/50">
            <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
              <div className="rounded-full bg-amber-500/10 p-4 mb-4 group-hover:bg-amber-500/20 transition-colors">
                <MessageSquareIcon className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-lg">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-6">Chat with our support team</p>
              <Button variant="outline" size="sm" className="w-full bg-background shadow-sm group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-colors">
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <div className="flex flex-col h-full">
            <Card className="border-border/50 shadow-sm flex-1">
              <CardHeader className="bg-muted/20 border-b border-border/50 pb-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HelpCircleIcon className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>Find quick answers to common questions</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search FAQs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-background border-border/50 focus-visible:ring-primary/20"
                    />
                  </div>
                </div>

                <Accordion type="single" collapsible className="space-y-3">
                  {filteredFAQs.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border border-border/50 rounded-lg px-4 bg-background">
                      <AccordionTrigger className="text-left font-medium hover:no-underline hover:text-primary transition-colors py-4">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {filteredFAQs.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-border/50 border-dashed mt-4">
                    <HelpCircleIcon className="h-8 w-8 mx-auto mb-3 opacity-30" />
                    <p>No FAQs found matching your search.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Support */}
          <div className="space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="border-b border-border/50 pb-6">
                <CardTitle className="text-lg">Contact Support</CardTitle>
                <CardDescription>Get in touch with our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center gap-4 p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="rounded-full bg-primary/10 p-3">
                    <PhoneIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Phone Support</p>
                    <p className="text-sm text-muted-foreground mt-0.5">1-800-FINANCE (24/7)</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="rounded-full bg-emerald-500/10 p-3">
                    <MailIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Email Support</p>
                    <p className="text-sm text-muted-foreground mt-0.5">support@befinance.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="rounded-full bg-amber-500/10 p-3">
                    <MessageSquareIcon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Live Chat</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Available 9 AM - 6 PM EST</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="border-b border-border/50 pb-6">
                <CardTitle className="text-lg">Submit Support Ticket</CardTitle>
                <CardDescription>Describe your issue and we'll help you resolve it</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Brief description of your issue" className="bg-background border-border/50" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select id="priority" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-border/50">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select id="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-border/50">
                      <option>Technical Issue</option>
                      <option>Account Problem</option>
                      <option>Feature Request</option>
                      <option>Training</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about your issue..."
                    rows={4}
                    className="bg-background border-border/50 resize-none"
                  />
                </div>

                <Button onClick={handleSubmitTicket} className="w-full bg-primary hover:bg-primary/90">
                  Submit Ticket
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-muted/20 border-b border-border/50 pb-6">
                <CardTitle className="text-lg">System Status</CardTitle>
                <CardDescription>Current status of our services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Loan Processing System</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-transparent font-medium">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Database Services</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-transparent font-medium">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Authentication System</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-transparent font-medium">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Notification Services</span>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-transparent font-medium">Degraded</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HelpSupport;
