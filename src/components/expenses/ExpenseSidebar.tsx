import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, Utensils, Car, ShoppingBag, BanknoteIcon, MoreHorizontal, Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categories = [
  { id: "investment", label: "Investment", icon: Wallet },
  { id: "food", label: "Food and Dining", icon: Utensils },
  { id: "transport", label: "Transportation", icon: Car },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "loan", label: "Loan", icon: BanknoteIcon },
  { id: "medical", label: "Medical", icon: Stethoscope },
  { id: "others", label: "Others", icon: MoreHorizontal },
];

interface ExpenseSidebarProps {
  onExpenseAdded: () => void;
  selectedMonth: string;
  selectedYear: string;
  selectedCategory: string;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  prefilledData?: {
    amount: string;
    category: string;
    description: string;
    date?: string;
  } | null;
  onClearPrefilled?: () => void;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

export const ExpenseSidebar = ({
  onExpenseAdded,
  selectedMonth,
  selectedYear,
  selectedCategory,
  onMonthChange,
  onYearChange,
  onCategoryChange,
  prefilledData,
  onClearPrefilled
}: ExpenseSidebarProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle prefilled data from AI extraction
  useEffect(() => {
    if (prefilledData) {
      setAmount(prefilledData.amount);
      setDescription(prefilledData.description);
      setCategory(prefilledData.category);
      
      // Show a highlighted state to indicate AI-extracted data
      toast.success("AI extracted expense data! Please review and confirm.", {
        duration: 5000,
      });
    }
  }, [prefilledData]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("expenses").insert({
        amount: parseFloat(amount),
        description,
        category,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success("Expense added successfully", {
        duration: 3000,
      });

      setAmount("");
      setDescription("");
      setCategory("");
      
      // Clear prefilled data after successful submission
      if (onClearPrefilled) {
        onClearPrefilled();
      }
      
      onExpenseAdded();
    } catch (error: any) {
      toast.error(error.message, {
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setAmount("");
    setDescription("");
    setCategory("");
    if (onClearPrefilled) {
      onClearPrefilled();
    }
  };

  const handleFilter = () => {
    onExpenseAdded();
    toast.success("Filters applied successfully", {
      duration: 3000,
    });
  };

  return (
    <div className="w-80 min-h-screen bg-sidebar p-6 space-y-8 border-r">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add New Expense</h2>
          {prefilledData && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearForm}
              className="text-xs"
            >
              Clear
            </Button>
          )}
        </div>
        
        {prefilledData && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm text-purple-700 font-medium">
              ✨ AI extracted data - Review and confirm
            </p>
          </div>
        )}
        
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
            <Input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`pl-8 rounded-[24px] ${prefilledData ? 'border-purple-300 bg-purple-50' : ''}`}
              required
            />
          </div>

          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger className={`rounded-[24px] ${prefilledData ? 'border-purple-300 bg-purple-50' : ''}`}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="rounded-[24px]">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <SelectItem key={cat.id} value={cat.id} className="rounded-[24px]">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {cat.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`rounded-[24px] ${prefilledData ? 'border-purple-300 bg-purple-50' : ''}`}
          />

          <Button
            type="submit"
            className="w-full rounded-[24px]"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Expense"}
          </Button>
        </form>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Filters</h2>
        <div className="space-y-4">
          <Select value={selectedMonth} onValueChange={onMonthChange}>
            <SelectTrigger className="rounded-[24px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent className="rounded-[24px]">
              {months.map((month, index) => (
                <SelectItem 
                  key={index} 
                  value={(index + 1).toString().padStart(2, '0')}
                  className="rounded-[24px]"
                >
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="rounded-[24px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="rounded-[24px]">
              <SelectItem value="All Categories" className="rounded-[24px]">
                All Categories
              </SelectItem>
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <SelectItem key={cat.id} value={cat.label} className="rounded-[24px]">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {cat.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Button
            onClick={handleFilter}
            className="w-full rounded-full"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
