
import { useState } from 'react';
import { useApplications } from '@/contexts/ApplicationContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Search, UserCircle, CheckCircle, XCircle, ArrowRightIcon } from 'lucide-react';

const Customers = () => {
  const { user } = useAuth();
  const { applications } = useApplications();
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique customers from applications
  // In a real application, this would be a separate table in the database
  const getUniqueCustomers = () => {
    const uniqueEmails = new Set();
    return applications
      .filter(app => {
        if (uniqueEmails.has(app.email)) {
          return false;
        }
        uniqueEmails.add(app.email);
        return true;
      })
      .map(app => ({
        id: app.id,
        fullName: app.fullName,
        email: app.email,
        phone: app.phone,
        businessName: app.businessName,
        businessType: app.businessType,
        totalApplications: applications.filter(a => a.email === app.email).length,
        approvedApplications: applications.filter(a => a.email === app.email && a.status === 'approved').length,
        rejectedApplications: applications.filter(a => a.email === app.email && a.status === 'rejected').length,
        creditScore: app.creditScore,
      }));
  };

  const customers = getUniqueCustomers();

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      customer.fullName.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.businessName.toLowerCase().includes(query) ||
      customer.businessType.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your customer relationships and their applications.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border/50 shadow-sm overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total Customers</h3>
                <div className="rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                  <UserCircle className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold tracking-tight text-foreground">{customers.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Approved Borrowers</h3>
                <div className="rounded-full bg-emerald-500/10 p-3 transition-colors group-hover:bg-emerald-500/20">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold tracking-tight text-emerald-600">
                  {customers.filter(c => c.approvedApplications > 0).length}
                </span>
                <span className="ml-2 text-sm text-muted-foreground font-medium">with active loans</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Rejected Profiles</h3>
                <div className="rounded-full bg-destructive/10 p-3 transition-colors group-hover:bg-destructive/20">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  {customers.filter(c => c.rejectedApplications > 0).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Customer List */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/50 pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-lg">Customer Directory</CardTitle>
                <CardDescription>View, search, and manage your customer profiles</CardDescription>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, email, business..."
                  className="pl-9 bg-background border-border/50 focus-visible:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold px-6 py-4">Customer Info</TableHead>
                    <TableHead className="font-semibold px-6 py-4">Business Details</TableHead>
                    <TableHead className="font-semibold px-6 py-4">Applications</TableHead>
                    <TableHead className="font-semibold px-6 py-4">Credit Score</TableHead>
                    <TableHead className="font-semibold text-right px-6 py-4">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/50">
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <UserCircle className="h-8 w-8 text-muted-foreground/30" />
                          <p>
                            {searchQuery
                              ? "No customers found matching your search criteria."
                              : "No customers are available."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-muted/30 transition-colors group">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-semibold">
                              {customer.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{customer.fullName}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{customer.email}</div>
                              <div className="text-xs text-muted-foreground">{customer.phone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div>
                            <div className="font-medium text-foreground">{customer.businessName}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{customer.businessType}</div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="font-medium bg-muted text-muted-foreground border-transparent">
                              Total: {customer.totalApplications}
                            </Badge>
                            {customer.approvedApplications > 0 && (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 font-medium">
                                {customer.approvedApplications} Approved
                              </Badge>
                            )}
                            {customer.rejectedApplications > 0 && (
                              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-medium">
                                {customer.rejectedApplications} Rejected
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${customer.creditScore >= 720 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                customer.creditScore >= 650 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-destructive/10 text-destructive border-destructive/20'
                              }`}
                          >
                            {customer.creditScore}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
                          >
                            View
                            <ArrowRightIcon className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Customers;
