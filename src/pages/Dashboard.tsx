
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MoreHorizontal, Edit } from "lucide-react";
import { toast } from "sonner";
import { MonthTabs } from "@/components/expenses/MonthTabs";
import { ExpenseFormSheet } from "@/components/expenses/ExpenseFormSheet";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { VoiceExpenseCapture } from "@/components/expenses/VoiceExpenseCapture";
import { AIExpenseCapture } from "@/components/expenses/AIExpenseCapture";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { MobileNavigation } from "@/components/navigation/MobileNavigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Header } from "@/components/layout/Header";

const categories = [
  { id: "investment", label: "Investment", icon: null },
  { id: "food", label: "Food and Dining", icon: null },
  { id: "transport", label: "Transportation", icon: null },
  { id: "shopping", label: "Shopping", icon: null },
  { id: "loan", label: "Loan", icon: null },
  { id: "medical", label: "Medical", icon: null },
  { id: "bill", label: "Bill", icon: null },
  { id: "travel", label: "Travel", icon: null },
  { id: "others", label: "Others", icon: MoreHorizontal },
];

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Dashboard = () => {
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + '');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(false);
  const [prefilledData, setPrefilledData] = useState<{
    amount: string;
    category: string;
    description: string;
    date?: string;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [editingExpense, setEditingExpense] = useState<any>(null);

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth, selectedYear]);

  const fetchExpenses = async () => {
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

  const handleExpenseAdded = () => {
    fetchExpenses();
  };

  const clearPrefilledData = () => {
    setPrefilledData(null);
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
  };

  const handleFilter = () => {
    fetchExpenses();
  };

  const filteredExpenses = expenses.filter(expense => {
    if (selectedCategory === "All Categories") return true;
    return expense.category === selectedCategory.toLowerCase().replace(/\s+/g, '');
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pb-20 md:pb-8 max-w-full overflow-x-hidden">
        {/* Month Navigation */}
        <div className="w-full overflow-hidden">
          <MonthTabs
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>

        {/* AI Expense Capture */}
        <div className="px-4 py-4">
          <AIExpenseCapture onExpenseExtracted={setPrefilledData} />
        </div>

        {/* Add Expense Button */}
        <div className="px-4 pb-4">
          <ExpenseFormSheet
            onExpenseAdded={handleExpenseAdded}
            prefilledData={prefilledData}
            onClearPrefilled={clearPrefilledData}
          />
        </div>

        {/* Total Expense Card */}
        <div className="px-4 pb-4">
          <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Total Expenses</h2>
              <p className="text-3xl font-bold">₹{totalExpense.toLocaleString('en-IN')}</p>
              <p className="text-sm opacity-90">
                {monthNames[parseInt(selectedMonth) - 1]} {selectedYear}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Expense List */}
        <div className="space-y-2 px-4">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No expenses found for the selected month.
            </div>
          ) : (
            filteredExpenses.map((expense) => {
              const category = categories.find(cat => cat.id === expense.category);
              const Icon = category?.icon || MoreHorizontal;
              
              return (
                <Card
                  key={expense.id}
                  className="border rounded-[16px] hover:border-gray-300 transition-colors overflow-hidden"
                >
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded-[12px] shrink-0" style={{ background: "linear-gradient(to right, #9333ea, #2563eb)" }}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="font-semibold truncate text-sm">{expense.description || "No description"}</p>
                        <p className="text-xs capitalize text-gray-600">{category?.label || expense.category}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(expense.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditExpense(expense)}
                          className="h-7 w-7 p-0 rounded-full"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <p className="text-base font-bold whitespace-nowrap" style={{ background: "linear-gradient(to right, #9333ea, #2563eb)", WebkitTextFillColor: "transparent", WebkitBackgroundClip: "text" }}>₹{expense.amount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Voice Expense Capture - positioned for mobile visibility */}
      <div className="fixed bottom-32 left-4 z-50">
        <VoiceExpenseCapture onExpenseExtracted={setPrefilledData} />
      </div>

      {/* Expense Filters */}
      <div className="fixed bottom-24 left-4 z-50">
        <ExpenseFilters
          selectedYear={selectedYear}
          selectedCategory={selectedCategory}
          onYearChange={setSelectedYear}
          onCategoryChange={setSelectedCategory}
          onFilter={handleFilter}
        />
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Edit Expense Dialog */}
      {editingExpense && (
        <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm
              onExpenseAdded={() => {
                handleExpenseAdded();
                setEditingExpense(null);
              }}
              editingExpense={editingExpense}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Dashboard;
