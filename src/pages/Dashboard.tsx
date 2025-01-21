import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Utensils, Car, ShoppingBag, BanknoteIcon, MoreHorizontal, Trash2, Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Header } from "@/components/layout/Header";
import { useNavigate } from "react-router-dom";
import { ResponsivePie } from "@nivo/pie";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
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
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + '');
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  useEffect(() => {
    if (tabsRef.current) {
      const currentMonthTab = tabsRef.current.querySelector(`[data-value="${selectedMonth}"]`);
      if (currentMonthTab) {
        const tabsList = tabsRef.current.querySelector('[role="tablist"]');
        if (tabsList) {
          const scrollPosition = currentMonthTab.getBoundingClientRect().left - 
            tabsList.getBoundingClientRect().left - 
            (tabsList.clientWidth - currentMonthTab.clientWidth) / 2;
          tabsList.scrollLeft = scrollPosition;
        }
      }
    }
  }, [selectedMonth]);

  const handleFilter = () => {
    fetchExpenses();
    setIsSidebarOpen(false);
    toast.success("Filters applied successfully", {
      duration: 3000,
    });
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <div className="container py-4 md:py-8">
        <div className="mb-6 relative" ref={tabsRef}>
          <Tabs 
            defaultValue={currentMonth}
            value={selectedMonth}
            onValueChange={setSelectedMonth} 
            className="w-full"
          >
            <TabsList className="inline-flex w-full md:justify-center justify-start p-2 overflow-x-auto no-scrollbar">
              {months.map((month, index) => (
                <TabsTrigger
                  key={index}
                  value={(index + 1).toString().padStart(2, '0')}
                  className="min-w-[100px] rounded-full"
                  data-value={(index + 1).toString().padStart(2, '0')}
                  style={{
                    background: selectedMonth === (index + 1).toString().padStart(2, '0') 
                      ? "linear-gradient(to right, #243949 0%, #517fa4 100%)" 
                      : "transparent",
                    color: selectedMonth === (index + 1).toString().padStart(2, '0') ? "white" : "inherit"
                  }}
                >
                  {month}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <Card className="col-span-1 md:col-span-2 mb-8 shadow-none border-0">
              <CardContent className="p-2">
                <div className="relative h-[250px]">
                  <ResponsivePie
                    data={getPieChartData()}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    innerRadius={0.6}
                    padAngle={0.7}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    colors={[
                      "#9b87f5",
                      "#7E69AB",
                      "#6E59A5",
                      "#8B5CF6",
                      "#D946EF",
                      "#1EAEDB"
                    ]}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                    enableArcLinkLabels={false}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                  />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                    <p className="text-3xl font-bold">₹{totalExpense.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
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
                      className="border rounded-[16px] hover:border-gray-300 transition-colors overflow-hidden"
                      style={{
                        background: "linear-gradient(to right, #243949 0%, #517fa4 100%)",
                        color: "white"
                      }}
                    >
                      <CardContent className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="p-2 rounded-[16px] bg-white/10 border border-white/20 shrink-0">
                            <CategoryIcon className="h-6 w-6" />
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <p className="font-semibold truncate">{expense.description || "No description"}</p>
                            <p className="text-sm text-white/70 capitalize">{expense.category}</p>
                            <p className="text-xs text-white/50">
                              {new Date(expense.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <p className="text-xl font-bold whitespace-nowrap">₹{expense.amount}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-[16px] hover:bg-white/10 shrink-0"
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
        <ExpenseFilters
          selectedYear={selectedYear}
          selectedCategory={selectedCategory}
          onYearChange={setSelectedYear}
          onCategoryChange={setSelectedCategory}
          onFilter={handleFilter}
        />
        <div className="flex-1" />
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="rounded-full w-14 h-14 shadow-lg"
              style={{
                background: "linear-gradient(to right, #ee9ca7, #ffdde1)",
                color: "white"
              }}
            >
              <PlusCircle className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-4">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Add New Expense</h2>
              <ExpenseForm onExpenseAdded={() => {
                fetchExpenses();
                setIsSidebarOpen(false);
              }} />
            </div>
          </SheetContent>
        </Sheet>
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
