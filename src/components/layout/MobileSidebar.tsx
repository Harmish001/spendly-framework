import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { ExpenseFilters } from "../expenses/ExpenseFilters";

interface MobileSidebarProps {
  selectedMonth: string;
  selectedYear: string;
  selectedCategory: string;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onFilter: () => void;
}

export const MobileSidebar = ({
  selectedMonth,
  selectedYear,
  selectedCategory,
  onMonthChange,
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
        <div className="flex flex-col gap-4 mt-4">
          <Link to="/statistics" className="w-full">
            <Button 
              className="w-full rounded-[16px]"
              style={{ background: "linear-gradient(to right, #ee9ca7, #ffdde1)" }}
            >
              View Statistics
            </Button>
          </Link>
          <div className="space-y-4">
            <h3 className="font-semibold">Filters</h3>
            <ExpenseFilters
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              selectedCategory={selectedCategory}
              onMonthChange={onMonthChange}
              onYearChange={onYearChange}
              onCategoryChange={onCategoryChange}
              onFilter={onFilter}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};