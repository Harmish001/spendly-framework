import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChartPie, Filter } from "lucide-react";
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
        <div className="flex flex-col gap-6 mt-6">
          <nav className="space-y-2">
            <Link to="/statistics" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent">
              <ChartPie className="h-5 w-5" />
              Statistics
            </Link>
            <div className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent cursor-pointer">
              <Filter className="h-5 w-5" />
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
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};