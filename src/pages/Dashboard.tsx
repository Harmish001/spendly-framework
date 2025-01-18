import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Wallet, Utensils, Car, ShoppingBag, BanknoteIcon, MoreHorizontal, Trash2, ChartPie, Plus } from "lucide-react";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

      if (error) throw error;

      toast.success("Expense deleted successfully", {
        duration: 3000,
      });

      fetchExpenses();
      setExpenseToDelete(null);
    } catch (error: any) {
      toast.error(error.message, {
        duration: 3000,
      });
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out", {
        duration: 3000,
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
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Spendly
          </h1>
          <div className="flex items-center gap-4">
            {!isMobile && (
              <Link to="/statistics">
                <Button
                  variant="outline"
                  className="rounded-[16px]"
                  style={{ background: "linear-gradient(to right, #243949 0%, #517fa4 100%)", color: "white" }}
                >
                  <ChartPie className="h-5 w-5 mr-2" />
                  Statistics
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              className="rounded-[16px]"
              onClick={handleSignOut}
              style={{ background: "linear-gradient(to right, #243949 0%, #517fa4 100%)", color: "white" }}
            >
              <LogOut className="h-5 w-5" />
              {!isMobile && <span className="ml-2">Sign Out</span>}
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-4 md:py-8">
        <Card className="rounded-[16px] overflow-hidden mb-8" style={{ background: "linear-gradient(to right, #243949 0%, #517fa4 100%)" }}>
          <CardContent className="p-6 flex flex-col items-start">
            <p className="text-lg font-semibold mb-2 text-white">{currentMonthName} {selectedYear} - Total Expenses</p>
            <p className="text-3xl font-bold text-white">₹{totalExpense.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>

        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                className="fixed bottom-6 left-6 rounded-full w-12 h-12 shadow-lg"
                style={{ background: "linear-gradient(to right, #243949 0%, #517fa4 100%)" }}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Add New Expense</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <ExpenseForm onExpenseAdded={fetchExpenses} />
              </div>
            </SheetContent>
          </Sheet>
        )}

        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg"
                style={{ background: "linear-gradient(to right, #243949 0%, #517fa4 100%)" }}
              >
                <ChartPie className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Statistics</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <Link to="/statistics" className="w-full">
                  <Button
                    className="w-full rounded-[16px]"
                    style={{ background: "linear-gradient(to right, #243949 0%, #517fa4 100%)" }}
                  >
                    View Statistics
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {!isMobile && (
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  className="rounded-[16px] w-full md:w-auto"
                  style={{ background: "linear-gradient(to right, #243949 0%, #517fa4 100%)" }}
                >
                  Add Expense
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Add New Expense</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <ExpenseForm onExpenseAdded={fetchExpenses} />
                </div>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  className="rounded-[16px] w-full md:w-auto"
                  style={{ background: "linear-gradient(to right, #243949 0%, #517fa4 100%)" }}
                >
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Expenses</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <ExpenseFilters
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    selectedCategory={selectedCategory}
                    onMonthChange={setSelectedMonth}
                    onYearChange={setSelectedYear}
                    onCategoryChange={setSelectedCategory}
                    onFilter={fetchExpenses}
                  />
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
