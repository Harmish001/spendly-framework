
import { Button } from "@/components/ui/button";
import { LogOut, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export const Header = () => {
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);

  // Check if user is connected to Google when component mounts
  useEffect(() => {
    const checkGoogleConnection = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const providers = user.app_metadata?.providers || [];
          setGoogleConnected(providers.includes('google'));
        }
      } catch (error) {
        console.error("Error checking Google connection:", error);
      }
    };
    
    checkGoogleConnection();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      navigate("/");
    }
  };

  const handleConnectGoogle = async () => {
    setConnecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be signed in to connect your Google account");
        navigate("/");
        return;
      }

      // Initiate Google OAuth connection
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          // Updated scopes according to latest Google Pay API documentation
          scopes: 'email profile openid',
        }
      });

      if (error) {
        toast.error(`Failed to connect Google: ${error.message}`);
      }
    } catch (error) {
      toast.error("An error occurred while connecting to Google");
      console.error(error);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{ background: "linear-gradient(to right, #9333ea, #2563eb)"}}>
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="pt-1 h-8 w-8 text-white rounded" />
            <span className="text-white bg-clip-text text-transparent">
              Spendly
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2 bg-white text-purple-700 hover:bg-white/90 border-none"
            onClick={handleConnectGoogle}
            disabled={connecting}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              width="16" 
              height="16"
              fill="none"
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.36 14.36c-1.43 1.43-3.34 2.23-5.36 2.23s-3.93-.79-5.36-2.23c-1.43-1.43-2.23-3.34-2.23-5.36s.79-3.93 2.23-5.36C8.07 4.21 9.98 3.41 12 3.41s3.93.79 5.36 2.23c1.43 1.43 2.23 3.34 2.23 5.36s-.79 3.93-2.23 5.36z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 12H9"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 9v6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{connecting ? "Connecting..." : googleConnected ? "Connected" : "Connect Google"}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden rounded-full p-2 bg-white text-purple-700"
            onClick={handleConnectGoogle}
            disabled={connecting}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              width="16" 
              height="16"
              fill="none"
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.36 14.36c-1.43 1.43-3.34 2.23-5.36 2.23s-3.93-.79-5.36-2.23c-1.43-1.43-2.23-3.34-2.23-5.36s.79-3.93 2.23-5.36C8.07 4.21 9.98 3.41 12 3.41s3.93.79 5.36 2.23c1.43 1.43 2.23 3.34 2.23 5.36s-.79 3.93-2.23 5.36z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 12H9"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 9v6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
          <LogOut className="h-6 w-6 sm:hidden text-white cursor-pointer" onClick={handleSignOut} />
          <span onClick={handleSignOut} className="ml-2 text-xl font-bold hidden md:inline text-white cursor-pointer">Sign Out</span>
        </div>
      </div>
    </header>
  );
};
