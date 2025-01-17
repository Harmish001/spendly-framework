import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

interface ExpenseFiltersProps {
  selectedMonth: string;
  selectedYear: string;
  selectedCategory: string;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

const categories = [
  "All Categories",
  "Investment",
  "Food and Dining",
  "Transportation",
  "Shopping",
  "Loan",
  "Others"
];

export const ExpenseFilters = ({
  selectedMonth,
  selectedYear,
  selectedCategory,
  onMonthChange,
  onYearChange,
  onCategoryChange
}: ExpenseFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-[16px]">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-[16px]">
        <DialogHeader>
          <DialogTitle>Filter Expenses</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedMonth} onValueChange={onMonthChange}>
            <SelectTrigger className="rounded-[16px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent className="rounded-[16px]">
              {months.map((month, index) => (
                <SelectItem 
                  key={index} 
                  value={(index + 1).toString().padStart(2, '0')}
                  className="rounded-[16px]"
                >
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={onYearChange}>
            <SelectTrigger className="rounded-[16px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="rounded-[16px]">
              {years.map((year) => (
                <SelectItem key={year} value={year} className="rounded-[16px]">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="rounded-[16px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="rounded-[16px]">
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="rounded-[16px]">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
};