"use client";

import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { MobileNavigation } from "@/components/navigation/MobileNavigation";
import { GRADIENTS } from "@/lib/constants/theme";
import { useIsMobile } from "@/hooks/use-mobile";

export const Header = ({ isTransparent = false }: { isTransparent?: boolean }) => {
  const { logout } = useAuth();
  const isMobile = useIsMobile();

  const handleSignOut = () => {
    logout();
    toast.success("Signed out successfully");
  };

  return (
    <header
      className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ background: isTransparent ? "transparent" : GRADIENTS.PRIMARY }}
    >
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-1">
          {isMobile && <MobileNavigation />}
          <h1 className="text-xl font-bold text-white">Spendly</h1>
        </div>
        <div className="flex items-center">
          <LogOut
            className="h-6 w-6 mt-1 text-white cursor-pointer"
            onClick={handleSignOut}
          />
        </div>
      </div>
    </header>
  );
};
