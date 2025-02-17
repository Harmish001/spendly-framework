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
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{ background: "linear-gradient(to right, #9333ea, #2563eb)", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="pt-1 h-8 w-8 text-white rounded" />
            <span className="text-white bg-clip-text text-transparent">
              Spendly
            </span>
          </h1>
        </div>
        {/* <Button
          variant="outline"
          className="rounded-full bg-transparent text-white border-none hover:from-red-600 hover:to-pink-600 "
          onClick={handleSignOut}
        > */}
        <LogOut className="h-6 w-6 sm:hidden text-white" onClick={handleSignOut} />
        <span onClick={handleSignOut} className="ml-2 text-xl font-bold hidden md:inline text-white">Sign Out</span>
        {/* </Button> */}
      </div>
    </header>
  );
};