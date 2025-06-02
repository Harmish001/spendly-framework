
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Utensils, Car, ShoppingBag, BanknoteIcon, MoreHorizontal, Trash2, Loader2, PlusCircle, Stethoscope, Receipt, Plane } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Header } from "@/components/layout/Header";
import { useNavigate } from "react-router-dom";
import { ResponsivePie } from "@nivo/pie";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { MonthTabs } from "@/components/expenses/MonthTabs";
import { AIExpenseCapture } from "@/components/expenses/AIExpenseCapture";
import { VoiceExpenseCapture } from "@/components/expenses/VoiceExpenseCapture";
import { ExpenseFormSheet } from "@/components/expenses/ExpenseFormSheet";

const categoryIcons: Record<string, any> = {
  "investment": Wallet,
  "food": Utensils,
  "transport": Car,
  "shopping": ShoppingBag,
  "loan": BanknoteIcon,
  "medical": Stethoscope,
  "bill": Receipt,
  "travel": Plane,
  "others": MoreHorizontal,
};

const Dashboard = () => {
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + '');
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [prefilledData, setPrefilledData] = useState<{
    amount: string;
    category: string;
    description: string;
    date?: string;
  } | null>(null);
  const [isExpenseSheetOpen, setIsExpenseSheetOpen] = useState(false);
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

  useEffect(() => {
    if (!authChecking) {
      fetchExpenses();
    }
  }, [authChecking, selectedMonth, selectedYear, selectedCategory]);

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
          "Medical": "medical",
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

  const getPieChartData = () => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += Number(expense.amount);
    });

    return Object.entries(categoryTotals).map(([category, value]) => ({
      id: category,
      label: category.charAt(0).toUpperCase() + category.slice(1),
      value,
    }));
  };

  const handleFilter = () => {
    fetchExpenses();
    toast.success("Filters applied successfully", {
      duration: 3000,
    });
  };

  const handleExpenseExtracted = (data: {
    amount: string;
    category: string;
    description: string;
    date?: string;
  }) => {
    setPrefilledData(data);
    setIsExpenseSheetOpen(true); // Automatically open the sheet when AI data is extracted
  };

  const handleClearPrefilled = () => {
    setPrefilledData(null);
  };

  const handleExpenseAdded = () => {
    fetchExpenses();
    setIsExpenseSheetOpen(false); // Close the sheet after expense is added
    setPrefilledData(null); // Clear prefilled data
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pb-4 md:pb-8 max-w-full overflow-x-hidden">
        <div className="w-full overflow-hidden">
          <MonthTabs
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>

        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <Card className="col-span-1 md:col-span-2 mb-4 mt-2 border-0 shadow-none">
              <CardContent className="p-1">
                <div className="relative h-[250px]">
                  <ResponsivePie
                    data={getPieChartData()}
                    margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                    innerRadius={0.6}
                    padAngle={0.7}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    colors={[
                      "#9333ea",
                      "#2563eb",
                      "#1e4bb8",
                      "#7b2ac5",
                      "#b84bed",
                      "#5b8def",
                      "#312e81",
                    ]}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                    enableArcLinkLabels={false}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                  />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-sm">Total</p>
                    <p className="text-2xl font-bold" style={{ background: "linear-gradient(to right, #9333ea, #2563eb)", WebkitTextFillColor: "transparent", WebkitBackgroundClip: "text" }}>₹{totalExpense.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 container">
              {expenses.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No expenses found for the selected filters.
                </div>
              ) : (
                expenses.map((expense) => {
                  const CategoryIcon = categoryIcons[expense.category] || MoreHorizontal;
                  return (
                    <Card
                      key={expense.id}
                      className="border rounded-[24px] hover:border-gray-300 transition-colors overflow-hidden"
                    >
                      <CardContent className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="p-2 rounded-[24px] shrink-0" style={{ background: "linear-gradient(to right, #9333ea, #2563eb)" }}>
                            <CategoryIcon className="h-8 w-8 text-white" />
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <p className="font-semibold truncate">{expense.description || "No description"}</p>
                            <p className="text-sm capitalize">{expense.category}</p>
                            <p className="text-xs">
                              {new Date(expense.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <p className="text-xl font-bold whitespace-nowrap" style={{ background: "linear-gradient(to right, #9333ea, #2563eb)", WebkitTextFillColor: "transparent", WebkitBackgroundClip: "text" }}>₹{expense.amount}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-[24px] hover:bg-white/10 shrink-0"
                              onClick={() => setExpenseToDelete(expense.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 flex gap-4 w-full px-6">
        {/* Filter Button - visible on mobile */}
        <ExpenseFilters
          selectedYear={selectedYear}
          selectedCategory={selectedCategory}
          onYearChange={setSelectedYear}
          onCategoryChange={setSelectedCategory}
          onFilter={handleFilter}
        />
        
        {/* AI Expense Capture Button */}
        <AIExpenseCapture onExpenseExtracted={handleExpenseExtracted} />
        
        <div className="flex-1" />
        
        {/* Add Expense Button */}
        <ExpenseFormSheet 
          isOpen={isExpenseSheetOpen}
          onOpenChange={setIsExpenseSheetOpen}
          onExpenseAdded={handleExpenseAdded} 
          prefilledData={prefilledData}
          onClearPrefilled={handleClearPrefilled}
        />
      </div>

      <AlertDialog open={!!expenseToDelete} onOpenChange={() => setExpenseToDelete(null)}>
        <AlertDialogContent className="rounded-[24px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[24px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-[24px]"
              style={{ background: "linear-gradient(to right, #9333ea, #2563eb)" }}
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
