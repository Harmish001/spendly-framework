
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { supabase } from "./integrations/supabase/client";

// Handle OAuth redirect and query parameters
const AuthHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for hash fragments that might contain OAuth response data
    if (location.hash) {
      // Let Supabase auth handle the redirect
      const handleRedirect = async () => {
        const { error } = await supabase.auth.initialize();
        if (error) {
          console.error("Error handling redirect:", error);
        }
      };
      handleRedirect();
    }
  }, [location, navigate]);

  return null;
};

function App() {
  return (
    <Router>
      <AuthHandler />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
