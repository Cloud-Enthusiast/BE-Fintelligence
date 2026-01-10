import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import Analytics from "./pages/Analytics";
import Customers from "./pages/Customers";
import RiskManagement from "./pages/RiskManagement";
import Settings from "./pages/Settings";
import HelpSupport from "./pages/HelpSupport";
import ApplicationReview from "./pages/ApplicationReview";
import Register from "./pages/Register";
import DocumentProcessor from "./pages/DocumentProcessor";
import DocumentUploadDemo from "./components/DocumentUploadDemo";
import PdfDemo from "./pages/PdfDemo";
import PdfTestComponent from "./components/PdfTestComponent";
import EnhancedPdfDemo from "./pages/EnhancedPdfDemo";
import { AuthProvider } from "./contexts/AuthContext";
import { ApplicationProvider } from "./contexts/ApplicationContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ApplicationProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Legacy route - now redirects to landing page */}
                <Route 
                  path="/index" 
                  element={<Navigate to="/" replace />} 
                />

                {/* Protected Loan Officer routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/applications"
                  element={
                    <ProtectedRoute>
                      <Applications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute>
                      <Customers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/application-review/:id"
                  element={
                    <ProtectedRoute>
                      <ApplicationReview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/risk-management"
                  element={
                    <ProtectedRoute>
                      <RiskManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/help-support"
                  element={
                    <ProtectedRoute>
                      <HelpSupport />
                    </ProtectedRoute>
                  }
                />

                {/* Document processor */}
                <Route
                  path="/document-processor"
                  element={
                    <ProtectedRoute>
                      <DocumentProcessor />
                    </ProtectedRoute>
                  }
                />

                {/* Demo pages */}
                <Route
                  path="/upload-demo"
                  element={
                    <ProtectedRoute>
                      <DocumentUploadDemo />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pdf-demo"
                  element={
                    <ProtectedRoute>
                      <PdfDemo />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pdf-test"
                  element={
                    <ProtectedRoute>
                      <PdfTestComponent />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/enhanced-pdf-demo"
                  element={
                    <ProtectedRoute>
                      <EnhancedPdfDemo />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ApplicationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
