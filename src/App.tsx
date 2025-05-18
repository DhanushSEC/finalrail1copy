import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import RouteGuard from "@/components/auth/RouteGuard";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import RecordingPage from "./pages/RecordingPage";
import ProcessingPage from "./pages/ProcessingPage";
import DashboardPage from "./pages/DashboardPage";
import ModelTestPage from "./pages/ModelTestPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<RouteGuard authRequired={false} />}>
              <Route path="/login" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
            </Route>

            {/* Protected routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              
              <Route element={<RouteGuard authRequired={true} />}>
                <Route path="/record" element={<RecordingPage />} />
                {/* Keep these routes for functionality, but remove from visible navigation */}
                <Route path="/process" element={<ProcessingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/model-test" element={<ModelTestPage />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
