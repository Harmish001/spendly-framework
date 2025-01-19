import { Button } from "@/components/ui/button";
import { LogOut, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Header = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Spendly
          </h1>
        </div>
        <Button
          variant="outline"
          className="rounded-[16px]"
          onClick={handleSignOut}
          style={{ background: "linear-gradient(to right, #ee9ca7, #ffdde1)" }}
        >
          <LogOut className="h-5 w-5" />
          <span className="ml-2 hidden md:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
};