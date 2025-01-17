import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Wallet, Utensils, Car, ShoppingBag, BanknoteIcon, MoreHorizontal, Trash2 } from "lucide-react";
import { ExpenseModal } from "@/components/expenses/ExpenseModal";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";

const categoryIcons: Record<string, any> = {
  "investment": Wallet,
  "food": Utensils,
  "transport": Car,
  "shopping": ShoppingBag,
  "loan": BanknoteIcon,
  "others": MoreHorizontal,
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Dashboard = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1 + '');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + '');
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [totalExpense, setTotalExpense] = useState(0);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchExpenses = async () => {
    try {
      let query = supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (selectedMonth && selectedYear) {
        const startDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`;
        const lastDay = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
        const endDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-${lastDay}`;
        query = query.gte("date", startDate).lte("date", endDate);
      }

      if (selectedCategory !== "All Categories") {
        query = query.eq("category", selectedCategory.toLowerCase());
      }

      const { data, error } = await query;

      if (error) throw error;
      setExpenses(data || []);
      
      const total = (data || []).reduce((sum, expense) => sum + Number(expense.amount), 0);
      setTotalExpense(total);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
        duration: 4000,
      });
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense deleted successfully",
        duration: 4000,
      });

      fetchExpenses();
      setExpenseToDelete(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
        duration: 4000,
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
        duration: 4000,
      });
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth, selectedYear, selectedCategory]);

  const currentMonthName = months[parseInt(selectedMonth) - 1];

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
            className="rounded-[16px]"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="rounded-[16px] overflow-hidden" style={{ background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)" }}>
            <CardContent className="p-6">
              <p className="text-3xl font-bold">{currentMonthName} {selectedYear}</p>
            </CardContent>
          </Card>

          <Card className="rounded-[16px] overflow-hidden" style={{ background: "linear-gradient(to right, #243949 0%, #517fa4 100%)" }}>
            <CardContent className="p-6 flex flex-col items-start">
              <h2 className="text-lg font-semibold mb-2 text-white">Total Expenses</h2>
              <p className="text-3xl font-bold text-white">₹{totalExpense.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex justify-between items-center gap-4">
          <ExpenseModal onExpenseAdded={fetchExpenses} />
          <ExpenseFilters
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            selectedCategory={selectedCategory}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            onCategoryChange={setSelectedCategory}
          />
        </div>

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
                    <div className="text-left">
                      <p className="font-semibold">{expense.description || "No description"}</p>
                      <p className="text-sm text-gray-500 capitalize">{expense.category}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(expense.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-bold">₹{expense.amount}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-[16px] hover:bg-red-100 hover:text-red-600"
                      onClick={() => setExpenseToDelete(expense.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {expenses.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No expenses found for the selected filters.
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!expenseToDelete} onOpenChange={() => setExpenseToDelete(null)}>
        <AlertDialogContent className="rounded-[16px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[16px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-[16px] bg-red-500 hover:bg-red-600"
              onClick={() => expenseToDelete && handleDeleteExpense(expenseToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;