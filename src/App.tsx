
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import CreateApplication from "./pages/CreateApplication";
import DocumentProcessor from "./pages/DocumentProcessor";
import EligibilityChecker from "./pages/EligibilityChecker";
import { AuthProvider } from "./contexts/AuthContext";
import { ApplicationProvider } from "./contexts/ApplicationContext";
import { DocumentProvider } from "./contexts/DocumentContext";
import { TourProvider } from "./components/Tour/TourContext";
import { TourGuide } from "./components/Tour/TourGuide";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <TourProvider>
            <ApplicationProvider>
              <DocumentProvider>
                <Toaster />
                <Sonner />
                <TourGuide />
                <BrowserRouter>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />

                    {/* Legacy route - now redirects to landing page */}
                    <Route
                      path="/index"
                      element={<Navigate to="/" replace />}
                    />

                    {/* Protected Dashboard Routes */}
                    <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/applications" element={<Applications />} />
                      <Route path="/create-application" element={<CreateApplication />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/application-review/:id" element={<ApplicationReview />} />
                      <Route path="/risk-management" element={<RiskManagement />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/help-support" element={<HelpSupport />} />
                      <Route path="/document-processor" element={<DocumentProcessor />} />
                      <Route path="/eligibility-checker" element={<EligibilityChecker />} />
                    </Route>

                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </DocumentProvider>
            </ApplicationProvider>
          </TourProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
