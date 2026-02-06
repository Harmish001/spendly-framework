import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { GRADIENTS } from "@/constants/theme";

interface ExpenseFiltersProps {
  selectedYear: string;
  selectedCategory: string;
  onYearChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onFilter: () => void;
  showCategoryFilter?: boolean;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) =>
  (currentYear - 2 + i).toString(),
);

const categories = [
  "All Categories",
  "Investment",
  "Food and Dining",
  "Transportation",
  "Shopping",
  "Loan",
  "Medical",
  "Bill",
  "Travel",
  "HouseExpense",
  "Others",
];

export const ExpenseFilters = ({
  selectedYear,
  selectedCategory,
  onYearChange,
  onCategoryChange,
  onFilter,
  showCategoryFilter = true,
}: ExpenseFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className={`rounded-full ${isMobile ? "w-14 h-14" : "rounded-[24px]"}`}
          style={{ background: GRADIENTS.PRIMARY, color: "white" }}
          onClick={() => setIsOpen(true)}
        >
          <Filter className={`h-6 w-6 ${!isMobile && "mr-2"}`} />
          {!isMobile && "Filters"}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="rounded-t-[24px] border-0 max-h-[85vh] mb-4">
        <DrawerHeader className="text-center pb-2">
          <SheetTitle>Filter Expenses</SheetTitle>
        </DrawerHeader>
        <div className="space-y-4 mx-4">
          <Select value={selectedYear} onValueChange={onYearChange}>
            <SelectTrigger className="rounded-[24px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="rounded-[24px]">
              {years.map((year) => (
                <SelectItem key={year} value={year} className="rounded-[24px]">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showCategoryFilter && (
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="rounded-[24px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="rounded-[24px]">
                {categories.map((category) => (
                  <SelectItem
                    key={category}
                    value={category}
                    className="rounded-[24px]"
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            onClick={() => {
              onFilter();
              setIsOpen(false);
            }}
            className="w-full rounded-[24px]"
            style={{ background: GRADIENTS.PRIMARY }}
          >
            Apply Filters
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
