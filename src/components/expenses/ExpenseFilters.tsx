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
import { useIsMobile } from "@/hooks/use-mobile";
import { GRADIENTS } from "@/constants/theme";
import { SlideToConfirm } from "@/components/ui/SlideToConfirm";
import { BottomSheet } from "@/components/ui/BottomSheet";

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
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Filter Expenses"
      trigger={
        <Button
          variant="outline"
          className={`rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${isMobile ? "w-14 h-14 p-0 flex items-center justify-center p-0" : "rounded-[24px] px-6 h-12"}`}
          style={{ background: GRADIENTS.PRIMARY, color: "white", border: "none" }}
        >
          <Filter className={`h-6 w-6 ${!isMobile && "mr-2"}`} />
          {!isMobile && "Filters"}
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 ml-1">Select Year</label>
          <Select value={selectedYear} onValueChange={onYearChange}>
            <SelectTrigger className="rounded-[20px] h-12 border-gray-100 bg-gray-50/50">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="rounded-[20px]">
              {years.map((year) => (
                <SelectItem key={year} value={year} className="rounded-[14px]">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showCategoryFilter && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Select Category</label>
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="rounded-[20px] h-12 border-gray-100 bg-gray-50/50">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="rounded-[20px]">
                {categories.map((category) => (
                  <SelectItem
                    key={category}
                    value={category}
                    className="rounded-[14px]"
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="pt-2">
          <SlideToConfirm
            label="Apply Filters"
            onConfirm={() => {
              onFilter();
              setIsOpen(false);
            }}
            variant="confirm"
          />
        </div>
      </div>
    </BottomSheet>
  );
};

