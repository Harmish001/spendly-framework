
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, BarChart3, Plane, Home, ChartAreaIcon, Shield } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      title: "Dashboard",
      icon: Home,
      path: "/dashboard",
      description: "View all your expenses"
    },
    {
      title: "Password Manager",
      icon: Shield,
      path: "/passwords",
      description: "Secure password storage"
    },
    {
      title: "Statistics",
      icon: BarChart3,
      path: "/statistics",
      description: "View expense analytics"
    },
    {
      title: "Analysis",
      icon: ChartAreaIcon,
      path: "/monthlyAnalysis",
      description: "View expense analysis"
    },

  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Menu className="h-6 w-6 mr-2 mt-1 text-white" />
      </SheetTrigger>
      <SheetContent side="top" className="h-auto">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="grid gap-3 mt-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "outline"}
                className={`w-full justify-start h-auto p-4 rounded-[20px] ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
                    : ''
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className="h-6 w-6" />
                  <div className="text-left">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm opacity-80">{item.description}</p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
