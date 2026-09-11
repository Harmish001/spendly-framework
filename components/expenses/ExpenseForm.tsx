"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SlideToConfirm } from "@/components/ui/SlideToConfirm";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Wallet,
  Utensils,
  Car,
  ShoppingBag,
  BanknoteIcon,
  MoreHorizontal,
  Stethoscope,
  CalendarIcon,
  Receipt,
  Plane,
  House,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useExpenseMutations } from "@/hooks/useExpenseMutations";

const categories = [
  { id: "investment", label: "Investment", icon: Wallet },
  { id: "food", label: "Food and Dining", icon: Utensils },
  { id: "transport", label: "Transportation", icon: Car },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "loan", label: "Loan", icon: BanknoteIcon },
  { id: "medical", label: "Medical", icon: Stethoscope },
  { id: "bill", label: "Bill", icon: Receipt },
  { id: "travel", label: "Travel", icon: Plane },
  { id: "houseExpense", label: "House Expense", icon: House },
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
  editingExpense?: {
    _id?: string;
    id?: string;
    amount: number;
    category: string;
    description: string | null;
    date: string;
  } | null;
}

export const ExpenseForm = ({
  onExpenseAdded,
  prefilledData,
  onClearPrefilled,
  editingExpense,
}: ExpenseFormProps) => {
  const [amount, setAmount] = useState(() =>
    editingExpense ? editingExpense.amount.toString() : (prefilledData?.amount ?? "")
  );
  const [description, setDescription] = useState(() =>
    editingExpense ? (editingExpense.description ?? "") : (prefilledData?.description ?? "")
  );
  const [category, setCategory] = useState(() =>
    editingExpense ? editingExpense.category : (prefilledData?.category ?? "")
  );
  const [date, setDate] = useState<Date>(() => {
    if (editingExpense) return new Date(editingExpense.date);
    if (prefilledData?.date) return new Date(prefilledData.date);
    return new Date();
  });

  const { addExpense, editExpense, isAdding, isEditing } = useExpenseMutations();
  const isLoading = isAdding || isEditing;
  const isEditingMode = !!editingExpense;

  // Only react to prefilledData changes (e.g. AI-populated data arriving after mount)
  useEffect(() => {
    if (!editingExpense && prefilledData) {
      setAmount(prefilledData.amount);
      setDescription(prefilledData.description);
      setCategory(prefilledData.category);
      if (prefilledData.date) setDate(new Date(prefilledData.date));
    }
  }, [prefilledData, editingExpense]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;
    if (!amount || !category) {
      toast.error("Amount and category are required");
      return;
    }

    const formattedDate = format(date, "yyyy-MM-dd");
    const payload = {
      amount: parseFloat(amount),
      description,
      category: category as string,
      date: formattedDate,
    };

    if (isEditingMode && editingExpense) {
      const expenseId =
        (editingExpense as { _id?: string; id?: string })._id ||
        (editingExpense as { _id?: string; id?: string }).id ||
        "";
      editExpense({ id: expenseId, ...payload });
    } else {
      addExpense(payload);
    }

    // Reset form
    setAmount("");
    setDescription("");
    setCategory("");
    setDate(new Date());
    if (onClearPrefilled) onClearPrefilled();
    onExpenseAdded();
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
        <Input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="pl-8 rounded-[20px]"
          required
        />
      </div>

      <Select value={category || undefined} onValueChange={setCategory} required>
        <SelectTrigger className="rounded-[20px]">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent className="rounded-[20px]">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <SelectItem
                key={cat.id}
                value={cat.id}
                className="rounded-[20px]"
              >
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
        className="rounded-[20px]"
      />

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal rounded-[20px]",
              !date && "text-muted-foreground",
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
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      <SlideToConfirm
        label={isEditingMode ? "Update" : "Add Expense"}
        onConfirm={handleSubmit}
        loading={isLoading}
        variant="confirm"
      />
      <button type="submit" className="hidden" />
    </form>
  );
};
