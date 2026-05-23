
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplications } from '@/contexts/ApplicationContext';
import { useCustomers } from '@/hooks/useCustomers';
import { getCibilColorClass } from '@/config/scoringConfig';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Search, UserCircle, CheckCircle, XCircle, Plus, Loader2, FileStack, FilePlus2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BUSINESS_TYPES = [
  'Retail',
  'Manufacturing',
  'Services',
  'Trading',
  'Agriculture',
  'Technology',
  'Construction',
  'Food & Beverage',
  'Health & Beauty',
  'Logistics',
];

const Customers = () => {
  const { applications } = useApplications();
  const { customers, isLoading, addCustomer } = useCustomers();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    businessType: '',
    pan: '',
    gstin: '',
  });

  // Enrich each customer with their application stats (join on email)
  const enrichedCustomers = customers.map(c => {
    const customerApps = applications.filter(a => a.email === c.email);
    return {
      ...c,
      totalApplications: customerApps.length,
      approvedApplications: customerApps.filter(a => a.status === 'approved').length,
      rejectedApplications: customerApps.filter(a => a.status === 'rejected').length,
      // Latest credit score from applications (fallback to 0 if no apps yet)
      creditScore: customerApps.length > 0 ? customerApps[0].creditScore : 0,
    };
  });

  const filteredCustomers = enrichedCustomers.filter(customer => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.fullName.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.businessName.toLowerCase().includes(query) ||
      customer.businessType.toLowerCase().includes(query)
    );
  });

  const handleAddCustomer = async () => {
    if (!newCustomer.fullName || !newCustomer.businessName || !newCustomer.email) {
      toast({ variant: 'destructive', title: 'Required fields missing', description: 'Full name, business name, and email are required.' });
      return;
    }
    setIsSaving(true);
    try {
      await addCustomer({
        fullName: newCustomer.fullName,
        businessName: newCustomer.businessName,
        email: newCustomer.email,
        phone: newCustomer.phone,
        businessType: newCustomer.businessType,
        pan: newCustomer.pan || undefined,
        gstin: newCustomer.gstin || undefined,
      });
      toast({ title: 'Customer Added', description: `${newCustomer.businessName} has been added to your customer directory.` });
      setAddDialogOpen(false);
      setNewCustomer({ fullName: '', businessName: '', email: '', phone: '', businessType: '', pan: '', gstin: '' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to add customer', description: 'Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Customers</h1>
            <p className="text-muted-foreground mt-1">Manage your MSME client relationships and their applications.</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
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
                  {enrichedCustomers.filter(c => c.approvedApplications > 0).length}
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
                  {enrichedCustomers.filter(c => c.rejectedApplications > 0).length}
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading customers…</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption className="sr-only">Customer directory</TableCaption>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold px-6 py-4">Customer Info</TableHead>
                      <TableHead className="font-semibold px-6 py-4">Business Details</TableHead>
                      <TableHead className="font-semibold px-6 py-4">Applications</TableHead>
                      <TableHead className="font-semibold px-6 py-4">Credit Score</TableHead>
                      <TableHead className="font-semibold text-right px-6 py-4">Actions</TableHead>
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
                                : customers.length === 0
                                  ? "No customers yet — click \"Add Customer\" to get started."
                                  : "No customers are available."}
                            </p>
                            {!searchQuery && customers.length === 0 && (
                              <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(true)} className="gap-1.5 mt-2">
                                <Plus className="h-3.5 w-3.5" />
                                Add your first customer
                              </Button>
                            )}
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
                              {customer.pan && <div className="text-xs text-muted-foreground font-mono">PAN: {customer.pan}</div>}
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
                            {customer.creditScore > 0 ? (
                              <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${getCibilColorClass(customer.creditScore)}`}>
                                {customer.creditScore}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">No data yet</span>
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                title="View Documents"
                                className="text-primary hover:text-primary hover:bg-primary/10 gap-1"
                                onClick={() => navigate('/document-processor', { state: { preselectedCustomerId: customer.id } })}
                              >
                                <FileStack className="h-3.5 w-3.5" />
                                Docs
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="New Application"
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1"
                                onClick={() => navigate('/create-application', { state: { prefilledCustomer: customer } })}
                              >
                                <FilePlus2 className="h-3.5 w-3.5" />
                                Apply
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Customer Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Create a customer record before uploading documents or running an eligibility check.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Ravi Kumar"
                  value={newCustomer.fullName}
                  onChange={e => setNewCustomer(p => ({ ...p, fullName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  placeholder="Ravi Enterprises"
                  value={newCustomer.businessName}
                  onChange={e => setNewCustomer(p => ({ ...p, businessName: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ravi@example.com"
                  value={newCustomer.email}
                  onChange={e => setNewCustomer(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="9876543210"
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="businessType">Business Type</Label>
              <Select
                value={newCustomer.businessType}
                onValueChange={val => setNewCustomer(p => ({ ...p, businessType: val }))}
              >
                <SelectTrigger id="businessType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pan">PAN Number</Label>
                <Input
                  id="pan"
                  placeholder="ABCDE1234F"
                  className="font-mono uppercase"
                  value={newCustomer.pan}
                  onChange={e => setNewCustomer(p => ({ ...p, pan: e.target.value.toUpperCase() }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  placeholder="22AAAAA0000A1Z5"
                  className="font-mono uppercase"
                  value={newCustomer.gstin}
                  onChange={e => setNewCustomer(p => ({ ...p, gstin: e.target.value.toUpperCase() }))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomer} disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? 'Adding…' : 'Add Customer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
