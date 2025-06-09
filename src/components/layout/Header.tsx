
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileNavigation } from "@/components/navigation/MobileNavigation";

export const Header = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{ background: "linear-gradient(to right, #9333ea, #2563eb)" }}>
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-1">
          {isMobile && <MobileNavigation />}
          <h1 className="text-xl font-bold text-white bg-clip-text text-transparent">
            Spendly
          </h1>
        </div>

        <div className="flex items-center">
          <LogOut className="h-6 w-6 mt-1 text-white"   onClick={handleSignOut} />
        </div>
      </div>
    </header>
  );
};
