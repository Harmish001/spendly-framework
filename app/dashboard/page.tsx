"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useExpenses } from "@/hooks/useExpenses";
import {
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  Wallet,
  Utensils,
  Car,
  ShoppingBag,
  BanknoteIcon,
  Stethoscope,
  LucidePlane,
  ScrollText,
  House,
} from "lucide-react";
import { MonthTabs } from "@/components/expenses/MonthTabs";
import { ExpenseFormSheet } from "@/components/expenses/ExpenseFormSheet";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { AIExpenseCapture } from "@/components/expenses/AIExpenseCapture";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { Header } from "@/components/layout/Header";
import { ResponsivePie } from "@nivo/pie";
import { Badge } from "@/components/ui/badge";
import {
  GRADIENTS,
  getTextGradientStyle,
  getBackgroundGradientStyle,
} from "@/lib/constants/theme";
import { SlideToConfirm } from "@/components/ui/SlideToConfirm";
import { BottomSheet } from "@/components/ui/BottomSheet";

const categories = [
  { id: "investment", label: "Investment" },
  { id: "food", label: "Food and Dining" },
  { id: "transport", label: "Transportation" },
  { id: "shopping", label: "Shopping" },
  { id: "loan", label: "Loan" },
  { id: "medical", label: "Medical" },
  { id: "bill", label: "Bill" },
  { id: "travel", label: "Travel" },
  { id: "houseExpense", label: "House Expense" },
  { id: "others", label: "Others" },
];

const categoryIcons: Record<string, React.ElementType> = {
  investment: Wallet,
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  loan: BanknoteIcon,
  medical: Stethoscope,
  travel: LucidePlane,
  bill: ScrollText,
  others: MoreHorizontal,
  houseExpense: House,
};

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");

  const [isExpenseSheetOpen, setIsExpenseSheetOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear() + "",
  );
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [prefilledData, setPrefilledData] = useState<{
    amount: string;
    category: string;
    description: string;
    date?: string;
  } | null>(null);
  const [editingExpense, setEditingExpense] = useState<{
    _id?: string;
    id?: string;
    amount: number;
    category: string;
    description: string | null;
    date: string;
  } | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const { expenses, totalExpense, isLoading, removeExpense, isRemoving } =
    useExpenses({
      month: selectedMonth,
      year: selectedYear,
      category:
        selectedCategory !== "All Categories" ? selectedCategory : undefined,
    });

  // Handle ?shortcut=add-expense URL param
  useEffect(() => {
    if (searchParams.get("shortcut") === "add-expense") {
      setIsExpenseSheetOpen(true);
    }
  }, [searchParams]);

  // Open sheet when prefilled data is ready
  useEffect(() => {
    if (prefilledData) setIsExpenseSheetOpen(true);
  }, [prefilledData]);

  // Listen for shared expense events (PWA share target)
  useEffect(() => {
    const handleSharedExpense = (event: CustomEvent) => {
      setPrefilledData(event.detail);
    };
    window.addEventListener(
      "sharedExpenseProcessed",
      handleSharedExpense as EventListener,
    );
    return () =>
      window.removeEventListener(
        "sharedExpenseProcessed",
        handleSharedExpense as EventListener,
      );
  }, []);

  const getPieChartData = () => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((expense) => {
      if (!categoryTotals[expense.category])
        categoryTotals[expense.category] = 0;
      categoryTotals[expense.category] += Number(expense.amount);
    });
    return Object.entries(categoryTotals).map(([category, value]) => ({
      id: category,
      label: category.charAt(0).toUpperCase() + category.slice(1),
      value,
    }));
  };

  const handleDeleteExpense = (id: string) => {
    removeExpense(id);
    setExpenseToDelete(null);
  };

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
        <div className="px-4 py-0">
          <AIExpenseCapture onExpenseExtracted={setPrefilledData} />
        </div>

        {/* Add Expense Button */}
        <div className="px-4 pb-0">
          <ExpenseFormSheet
            onExpenseAdded={() => {
              setIsExpenseSheetOpen(false);
              setPrefilledData(null);
            }}
            prefilledData={prefilledData}
            onClearPrefilled={() => setPrefilledData(null)}
            isOpen={isExpenseSheetOpen}
            onOpenChange={setIsExpenseSheetOpen}
          />
        </div>

        {/* Total Expense Pie Chart */}
        <div className="px-4 pb-0">
          <Card className="col-span-1 md:col-span-2 mb-2 mt-2 border-0 shadow-none">
            <CardContent className="p-1">
              <div className="relative h-[250px]">
                <ResponsivePie
                  data={getPieChartData()}
                  margin={{ top: 0, right: 20, bottom: 10, left: 20 }}
                  innerRadius={0.6}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  colors={[
                    "#fbbf24",
                    "#fcd34d",
                    "#f59e0b",
                    "#f97316",
                    "#ea580c",
                    "#c2410c",
                  ]}
                  borderWidth={1}
                  borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                  enableArcLinkLabels={false}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{
                    from: "color",
                    modifiers: [["brighter", 3]],
                  }}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <p className="text-sm font-bold text-gray-500">Total</p>
                  <p
                    className="text-2xl font-bold"
                    style={getTextGradientStyle(GRADIENTS.PRIMARY)}
                  >
                    ₹{totalExpense.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense List */}
        <div className="space-y-3 px-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No expenses found for the selected month.
            </div>
          ) : (
            expenses.map((expense) => {
              const category = categories.find(
                (cat) => cat.id === expense.category,
              );
              const CategoryIcon =
                categoryIcons[expense.category] || MoreHorizontal;
              return (
                <div
                  key={expense._id}
                  className="relative overflow-hidden shadow-md rounded-[20px]"
                >
                  <Card
                    className="shadow-md from-white to-gray-50/50 border rounded-[20px] hover:border-gray-300 transition-colors overflow-hidden"
                    onClick={() => {}}
                  >
                    <CardContent className="flex items-center justify-between p-5">
                      <div className="flex items-center justify-center gap-3 flex-1 min-w-0">
                        <div
                          className="p-2 rounded-[14px] shrink-0"
                          style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
                        >
                          <CategoryIcon className="h-7 w-7 text-white" />
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <p className="font-muted truncate font-semibold text-sm">
                            {expense.description || "No description"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(expense.date).getDate()}&nbsp;
                            {new Date(expense.date).toLocaleString("default", {
                              month: "long",
                            })}
                          </p>
                        </div>
                        <div className="flex items-end gap-1 shrink-0 flex-col">
                          <p
                            className="text-base font-bold whitespace-nowrap"
                            style={getTextGradientStyle(GRADIENTS.PRIMARY)}
                          >
                            ₹{expense.amount}
                          </p>
                          <Badge
                            variant="secondary"
                            className="text-xs font-medium text-white hover:bg-gray-200"
                            style={getBackgroundGradientStyle(
                              GRADIENTS.PRIMARY,
                            )}
                          >
                            {category?.label || expense.category}
                          </Badge>
                        </div>
                        <div className="flex items-center flex-col justify-center">
                          <Edit
                            className="h-5 w-5 mb-2 text-gray-500 cursor-pointer"
                            onClick={() => setEditingExpense(expense)}
                          />
                          <Trash2
                            className="h-5 w-5 text-red-600 cursor-pointer"
                            onClick={() => setExpenseToDelete(expense._id)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Expense Filters */}
      <div className="fixed bottom-24 right-6 z-50">
        <ExpenseFilters
          selectedYear={selectedYear}
          selectedCategory={selectedCategory}
          onYearChange={setSelectedYear}
          onCategoryChange={setSelectedCategory}
          onFilter={() => {}}
        />
      </div>

      {/* Edit Expense Bottom Sheet */}
      <BottomSheet
        isOpen={!!editingExpense}
        onOpenChange={() => setEditingExpense(null)}
        title="Edit Expense"
      >
        <ExpenseForm
          key={editingExpense?._id ?? editingExpense?.id ?? "new"}
          onExpenseAdded={() => {
            setEditingExpense(null);
          }}
          editingExpense={editingExpense}
        />
      </BottomSheet>

      {/* Delete Expense Bottom Sheet */}
      <BottomSheet
        isOpen={!!expenseToDelete}
        onOpenChange={() => setExpenseToDelete(null)}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
      >
        <div className="pt-2">
          <SlideToConfirm
            label="Delete"
            onConfirm={() => handleDeleteExpense(expenseToDelete!)}
            variant="danger"
            loading={isRemoving}
          />
        </div>
      </BottomSheet>
    </div>
  );
}
