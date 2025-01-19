import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Utensils, Car, ShoppingBag, BanknoteIcon, MoreHorizontal, Trash2, Plus, Loader2 } from "lucide-react";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { Header } from "@/components/layout/Header";
import { useNavigate } from "react-router-dom";

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
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/');
          return;
        }
        setAuthChecking(false);
        fetchExpenses();
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate('/');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchExpenses = async () => {
    if (authChecking) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (selectedMonth && selectedYear) {
        const startDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`;
        const lastDay = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
        const endDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-${lastDay}`;
        query = query.gte("created_at", startDate).lte("created_at", endDate);
      }

      if (selectedCategory !== "All Categories") {
        const categoryMapping: Record<string, string> = {
          "Investment": "investment",
          "Food and Dining": "food",
          "Transportation": "transport",
          "Shopping": "shopping",
          "Loan": "loan",
          "Others": "others"
        };
        
        const mappedCategory = categoryMapping[selectedCategory];
        if (mappedCategory) {
          query = query.eq("category", mappedCategory);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setExpenses(data || []);
      
      const total = (data || []).reduce((sum, expense) => sum + Number(expense.amount), 0);
      setTotalExpense(total);
    } catch (error: any) {
      console.error("Error fetching expenses:", error.message);
      toast.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

      if (error) throw error;

      toast.success("Expense deleted successfully");
      fetchExpenses();
      setExpenseToDelete(null);
    } catch (error: any) {
      toast.error("Failed to delete expense");
    }
  };

  const currentMonthName = months[parseInt(selectedMonth) - 1];

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (loading && expenses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container py-4 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <MobileSidebar
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            selectedCategory={selectedCategory}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            onCategoryChange={setSelectedCategory}
            onFilter={fetchExpenses}
          />
        </div>

        <Card className="rounded-[16px] overflow-hidden mb-8" style={{ background: "linear-gradient(to right, #ee9ca7, #ffdde1)" }}>
          <CardContent className="p-6 flex flex-col items-start">
            <p className="text-lg font-semibold mb-2 text-white">{currentMonthName} {selectedYear} - Total Expenses</p>
            <p className="text-3xl font-bold text-white">₹{totalExpense.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>

        {isMobile && (
          <Sheet open={isExpenseFormOpen} onOpenChange={setIsExpenseFormOpen}>
            <SheetTrigger asChild>
              <Button
                className="fixed bottom-6 left-6 rounded-full w-12 h-12 shadow-lg"
                style={{ background: "linear-gradient(to right, #ee9ca7, #ffdde1)" }}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Add New Expense</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <ExpenseForm onExpenseAdded={() => {
                  fetchExpenses();
                  setIsExpenseFormOpen(false);
                }} />
              </div>
            </SheetContent>
          </Sheet>
        )}

        {!isMobile && (
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  className="rounded-[16px]"
                  style={{ background: "linear-gradient(to right, #ee9ca7, #ffdde1)" }}
                >
                  Add Expense
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Add New Expense</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <ExpenseForm onExpenseAdded={() => {
                    fetchExpenses();
                    setIsExpenseFormOpen(false);
                  }} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}

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
          {expenses.length === 0 && !loading && (
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
              className="rounded-[16px]"
              style={{ background: "linear-gradient(to right, #ee9ca7, #ffdde1)" }}
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