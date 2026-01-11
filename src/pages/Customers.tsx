
import { useState } from 'react';
import { useApplications } from '@/contexts/ApplicationContext';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
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
import { Search, UserCircle, CheckCircle, XCircle } from 'lucide-react';

const Customers = () => {
  const { user, logout } = useAuth();
  const { applications } = useApplications();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
              <p className="text-gray-600">Manage your customers and their applications</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium text-gray-500">Total Customers</h3>
                    <div className="rounded-full bg-blue-50 p-2">
                      <UserCircle className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{customers.length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium text-gray-500">With Approved Loans</h3>
                    <div className="rounded-full bg-green-50 p-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">
                      {customers.filter(c => c.approvedApplications > 0).length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium text-gray-500">With Rejected Loans</h3>
                    <div className="rounded-full bg-red-50 p-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">
                      {customers.filter(c => c.rejectedApplications > 0).length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Customer List */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Directory</CardTitle>
                <CardDescription>View and manage your customer information</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search customers by name, email, or business..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>List of customers who have applied for loans</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Business</TableHead>
                        <TableHead>Contact Information</TableHead>
                        <TableHead>Applications</TableHead>
                        <TableHead>Credit Score</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            {searchQuery 
                              ? "No customers found matching your search criteria"
                              : "No customers found"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.fullName}</TableCell>
                            <TableCell>
                              <div>
                                <div>{customer.businessName}</div>
                                <div className="text-xs text-gray-500">{customer.businessType}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div>{customer.email}</div>
                                <div className="text-xs text-gray-500">{customer.phone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="font-normal">
                                  Total: {customer.totalApplications}
                                </Badge>
                                {customer.approvedApplications > 0 && (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200 font-normal">
                                    {customer.approvedApplications} approved
                                  </Badge>
                                )}
                                {customer.rejectedApplications > 0 && (
                                  <Badge className="bg-red-100 text-red-800 hover:bg-red-200 font-normal">
                                    {customer.rejectedApplications} rejected
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div 
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  customer.creditScore >= 720 ? 'bg-green-100 text-green-800' :
                                  customer.creditScore >= 650 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                {customer.creditScore}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="outline">View Details</Button>
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
        </main>
      </div>
    </div>
  );
};

export default Customers;
