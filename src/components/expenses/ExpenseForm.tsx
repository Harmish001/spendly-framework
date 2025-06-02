
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Wallet, Utensils, Car, ShoppingBag, BanknoteIcon, MoreHorizontal, Loader2, Stethoscope, CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const categories = [
  { id: "investment", label: "Investment", icon: Wallet },
  { id: "food", label: "Food and Dining", icon: Utensils },
  { id: "transport", label: "Transportation", icon: Car },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "loan", label: "Loan", icon: BanknoteIcon },
  { id: "medical", label: "Medical", icon: Stethoscope },
  { id: "others", label: "Others", icon: MoreHorizontal },
];

interface ExpenseFormProps {
  onExpenseAdded: () => void;
  prefilledData?: {
    amount: string;
    category: string;
    description: string;
    date?: string;
  } | null;
  onClearPrefilled?: () => void;
}

export const ExpenseForm = ({ onExpenseAdded, prefilledData, onClearPrefilled }: ExpenseFormProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  // Handle prefilled data from AI extraction
  useEffect(() => {
    if (prefilledData) {
      setAmount(prefilledData.amount);
      setDescription(prefilledData.description);
      setCategory(prefilledData.category);
      if (prefilledData.date) {
        setDate(new Date(prefilledData.date));
      }
    }
  }, [prefilledData]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      // Format the date to match the database format
      const formattedDate = format(date, 'yyyy-MM-dd');

      const { error } = await supabase.from("expenses").insert({
        amount: parseFloat(amount),
        description,
        category,
        user_id: user.id,
        created_at: formattedDate,
      });

      if (error) throw error;

      toast.success("Expense added successfully");
      setAmount("");
      setDescription("");
      setCategory("");
      setDate(new Date());
      
      // Clear prefilled data after successful submission
      if (onClearPrefilled) {
        onClearPrefilled();
      }
      
      onExpenseAdded();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
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

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal rounded-[24px]",
              !date && "text-muted-foreground",
              prefilledData ? 'border-purple-300 bg-purple-50' : ''
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      <Button
        type="submit"
        className="w-full rounded-[24px]"
        style={{ background: "linear-gradient(to right, #9333ea, #2563eb)" }}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : null}
        {loading ? "Adding..." : "Add Expense"}
      </Button>
    </form>
  );
};
