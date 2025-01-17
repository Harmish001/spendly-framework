import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Select value={selectedMonth} onValueChange={onMonthChange}>
        <SelectTrigger className="rounded-[16px]">
          <SelectValue placeholder="Select month" />
        </SelectTrigger>
        <SelectContent>
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
        <SelectContent>
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
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category} value={category} className="rounded-[16px]">
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};