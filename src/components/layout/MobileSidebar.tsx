import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ExpenseFilters } from "../expenses/ExpenseFilters";

interface MobileSidebarProps {
  selectedYear: string;
  selectedCategory: string;
  onYearChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onFilter: () => void;
}

export const MobileSidebar = ({
  selectedYear,
  selectedCategory,
  onYearChange,
  onCategoryChange,
  onFilter
}: MobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 mt-6">
          <nav className="space-y-2">
            <ExpenseFilters
              selectedYear={selectedYear}
              selectedCategory={selectedCategory}
              onYearChange={onYearChange}
              onCategoryChange={onCategoryChange}
              onFilter={onFilter}
            />
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};