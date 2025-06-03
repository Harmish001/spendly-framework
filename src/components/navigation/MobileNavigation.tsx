
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, BarChart3, Plane, Home } from "lucide-react";
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
      title: "Travel Expenses",
      icon: Plane,
      path: "/travel-expenses",
      description: "Track your travel expenses"
    },
    {
      title: "Statistics",
      icon: BarChart3,
      path: "/statistics",
      description: "View expense analytics"
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-transparent text-white"
        >
          <Menu className="h-0 w-0" />
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="h-auto">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 mt-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "outline"}
                className={`w-full justify-start h-auto p-4 rounded-[24px] ${
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
