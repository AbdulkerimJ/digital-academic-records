import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import LandingPage from "./pages/LandingPage";
import PortalPage from "./pages/PortalPage";
import VerifyPage from "./pages/VerifyPage";
import StudentDashboard from "./pages/StudentDashboard";
import RegistrarDashboard from "./pages/RegistrarDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import { isPortalSubdomain } from "./lib/domain";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            {isPortalSubdomain() ? (
              /* --- PORTAL SUBDOMAIN ROUTES --- */
              <>
                <Route path="/" element={<PortalPage />} />
                <Route path="/student/:tab?" element={<StudentDashboard />} />
                <Route path="/registrar/:tab?" element={<RegistrarDashboard />} />
                <Route path="/admin/:tab?" element={<AdminDashboard />} />
                {/* Fallback for portal subdomain */}
                <Route path="*" element={<NotFound />} />
              </>
            ) : (
              /* --- MAIN DOMAIN ROUTES --- */
              <>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/verify" element={<VerifyPage />} />
                {/* Fallback for main domain */}
                <Route path="*" element={<NotFound />} />
              </>
            )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
