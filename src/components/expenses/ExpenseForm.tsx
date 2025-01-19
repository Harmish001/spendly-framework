import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, Utensils, Car, ShoppingBag, BanknoteIcon, MoreHorizontal, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categories = [
  { id: "investment", label: "Investment", icon: Wallet },
  { id: "food", label: "Food and Dining", icon: Utensils },
  { id: "transport", label: "Transportation", icon: Car },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "loan", label: "Loan", icon: BanknoteIcon },
  { id: "others", label: "Others", icon: MoreHorizontal },
];

interface ExpenseFormProps {
  onExpenseAdded: () => void;
}

export const ExpenseForm = ({ onExpenseAdded }: ExpenseFormProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

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

      toast.success("Expense added successfully");
      setAmount("");
      setDescription("");
      setCategory("");
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
          className="pl-8 rounded-[16px]"
          required
        />
      </div>

      <Select value={category} onValueChange={setCategory} required>
        <SelectTrigger className="rounded-[16px]">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent className="rounded-[16px]">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <SelectItem key={cat.id} value={cat.id} className="rounded-[16px]">
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
        className="rounded-[16px]"
      />

      <Button
        type="submit"
        className="w-full rounded-[16px]"
        style={{ background: "linear-gradient(to right, #ee9ca7, #ffdde1)" }}
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