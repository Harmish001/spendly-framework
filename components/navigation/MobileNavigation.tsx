"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  BarChart3,
  Home,
  ChartAreaIcon,
  Shield,
  CheckSquare,
} from "lucide-react";
import { GRADIENTS } from "@/lib/constants/theme";

export const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    { title: "Dashboard", icon: Home, path: "/dashboard", description: "View all your expenses" },
    { title: "Password Manager", icon: Shield, path: "/passwords", description: "Secure password storage" },
    { title: "Todos", icon: CheckSquare, path: "/todos", description: "Manage your tasks" },
    { title: "Statistics", icon: BarChart3, path: "/statistics", description: "View expense analytics" },
    { title: "Analysis", icon: ChartAreaIcon, path: "/monthly-analysis", description: "View expense analysis" },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Menu className="h-6 w-6 mr-2 text-white cursor-pointer" />
      </SheetTrigger>
      <SheetContent side="top" className="h-auto">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="grid gap-1 mt-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "outline"}
                className="w-full justify-start h-auto p-4 rounded-full"
                style={{
                  background: isActive ? GRADIENTS.PRIMARY : "",
                  color: isActive ? "white" : "inherit",
                  border: "none",
                }}
                onClick={() => handleNavigation(item.path)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className="h-6 w-6" />
                  <p className="font-semibold">{item.title}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
