import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Wallet, Coffee, Car, ShoppingBag, Tv, Wrench, MoreHorizontal } from "lucide-react";
import { ExpenseModal } from "@/components/expenses/ExpenseModal";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";

const categoryIcons: Record<string, any> = {
  "food": Coffee,
  "transport": Car,
  "shopping": ShoppingBag,
  "entertainment": Tv,
  "utilities": Wrench,
  "others": MoreHorizontal,
};

const Dashboard = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1 + '');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + '');
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchExpenses = async () => {
    try {
      let query = supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply date filter
      if (selectedMonth && selectedYear) {
        const startDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`;
        const endDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-31`;
        query = query.gte("date", startDate).lte("date", endDate);
      }

      // Apply category filter
      if (selectedCategory !== "All Categories") {
        query = query.eq("category", selectedCategory.toLowerCase());
      }

      const { data, error } = await query;

      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth, selectedYear, selectedCategory]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wallet className="h-8 w-8" />
            Spendly
          </h1>
          <Button
            variant="outline"
            className="rounded-[20px]"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <ExpenseModal onExpenseAdded={fetchExpenses} />
        </div>

        <ExpenseFilters
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedCategory={selectedCategory}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          onCategoryChange={setSelectedCategory}
        />

        <div className="space-y-4">
          {expenses.map((expense) => {
            const CategoryIcon = categoryIcons[expense.category] || MoreHorizontal;
            return (
              <Card
                key={expense.id}
                className="border rounded-[16px] hover:border-gray-300 transition-colors"
              >
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-[16px] border">
                      <CategoryIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">{expense.description || "No description"}</p>
                      <p className="text-sm text-gray-500">{expense.category}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(expense.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-bold">₹{expense.amount}</p>
                </CardContent>
              </Card>
            )
          })}
          {expenses.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No expenses found for the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;