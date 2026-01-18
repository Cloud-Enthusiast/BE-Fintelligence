
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
import { AuthProvider } from "./contexts/AuthContext";
import { ApplicationProvider } from "./contexts/ApplicationContext";
import { TourProvider } from "./components/Tour/TourContext";
import { TourGuide } from "./components/Tour/TourGuide";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <TourProvider>
            <ApplicationProvider>
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
                    path="/create-application"
                    element={
                      <ProtectedRoute>
                        <CreateApplication />
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

                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </ApplicationProvider>
          </TourProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
