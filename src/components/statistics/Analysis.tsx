import React, { useEffect, useState } from "react";
import { Header } from "../layout/Header";
import { supabase } from "@/integrations/supabase/client";
import {
  BanknoteIcon,
  Car,
  ChevronDown,
  ChevronUp,
  Loader2,
  LucidePlane,
  MoreHorizontal,
  ScrollText,
  ShoppingBag,
  Stethoscope,
  Utensils,
  Wallet,
  House,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { MonthTabs } from "../expenses/MonthTabs";
import { ExpenseFilters } from "../expenses/ExpenseFilters";

const categoryIcons = {
  investment: Wallet,
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  loan: BanknoteIcon,
  medical: Stethoscope,
  travel: LucidePlane,
  bill: ScrollText,
  houseExpense: House,
  others: MoreHorizontal,
};

const categories = [
  { id: "investment", label: "Investment", icon: null },
  { id: "food", label: "Food and Dining", icon: null },
  { id: "transport", label: "Transportation", icon: null },
  { id: "shopping", label: "Shopping", icon: null },
  { id: "loan", label: "Loan", icon: null },
  { id: "medical", label: "Medical", icon: null },
  { id: "bill", label: "Bill", icon: null },
  { id: "travel", label: "Travel", icon: null },
  { id: "houseExpense", label: "House Expense", icon: null },
  { id: "others", label: "Others", icon: MoreHorizontal },
];

interface CategoryExpense {
  category: string;
  total: number;
  expenses: any[];
}

function groupByCategory(data): CategoryExpense[] {
  const result: Record<string, { total: number; expenses: any[] }> = {};

  data.forEach((expense) => {
    const { category, amount } = expense;
    if (!result[category]) {
      result[category] = { total: 0, expenses: [] };
    }
    result[category].total += amount;
    result[category].expenses.push(expense);
  });

  return Object.entries(result).map(([category, data]) => ({
    category,
    total: data.total,
    expenses: data.expenses,
  }));
}

type AnalysisType = "Monthly" | "Yearly" | "Weekly";
const MonthlyAnalysis = () => {
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const [analysisType, setAnalysisType] = useState<AnalysisType>("Monthly");
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState<CategoryExpense[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear() + "",
  );
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (selectedMonth && selectedYear) {
        const startDate = `${selectedYear}-${selectedMonth.padStart(
          2,
          "0",
        )}-01`;
        const lastDay = new Date(
          parseInt(selectedYear),
          parseInt(selectedMonth),
          0,
        ).getDate();
        const endDate = `${selectedYear}-${selectedMonth.padStart(
          2,
          "0",
        )}-${lastDay}`;
        query = query.gte("created_at", startDate).lte("created_at", endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      const categoryData = groupByCategory(data || []);
      setExpenses(categoryData || []);
      const total = (data || []).reduce(
        (sum, expense) => sum + Number(expense.amount),
        0,
      );
      setTotalExpense(total);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleFilter = () => {
    fetchExpenses();
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth, selectedYear]);

  return (
    <>
      <Header />
      <div
        className="pt-8 px-8 px-4"
        style={{
          background: "linear-gradient(to right, #9333ea, #2563eb)",
        }}
      >
        <h1 className="text-2xl font-bold mb-2 text-white flex justify-center">
          {analysisType}&nbsp;Analysis
        </h1>
        <p className="text-2xl font-bold text-white flex justify-center">
          ₹{totalExpense.toLocaleString("en-IN")}{" "}
        </p>
      </div>
      <MonthTabs
        selectedMonth={selectedMonth}
        onMonthChange={(value) => setSelectedMonth(value)}
      />
      <p
        className="text-2xl font-bold mt-2 ml-8 mb-3"
        style={{
          background: "linear-gradient(to right, #9333ea, #2563eb)",
          WebkitTextFillColor: "transparent",
          WebkitBackgroundClip: "text",
        }}
      >
        Category wise Expense
      </p>
      {loading && (
        <div className="w-full flex justify-center align-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
        </div>
      )}
      {!loading && (
        <div className="space-y-3 px-4 pt-2 pb-24">
          {expenses.map((expense) => {
            const CategoryIcon = categoryIcons[expense.category];
            const isExpanded = expandedCategory === expense.category;
            return (
              <div key={expense.category}>
                <Card
                  className="shadow-md bg-gradient-to-r from-white to-gray-50/50 border rounded-[20px] hover:border-gray-300 transition-colors overflow-hidden cursor-pointer"
                  onClick={() => toggleCategory(expense.category)}
                >
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-[14px] shrink-0"
                          style={{
                            background:
                              "linear-gradient(to right, #9333ea, #2563eb)",
                          }}
                        >
                          <CategoryIcon className="h-7 w-7 text-white" />
                        </div>
                        <p className="font-semibold truncate text-sm">
                          {
                            categories.find(
                              (item) => item.id == expense.category,
                            ).label
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-end gap-1 flex-col">
                          <p
                            className="text-base font-bold whitespace-nowrap"
                            style={{
                              background:
                                "linear-gradient(to right, #9333ea, #2563eb)",
                              WebkitTextFillColor: "transparent",
                              WebkitBackgroundClip: "text",
                            }}
                          >
                            ₹{expense.total}
                          </p>
                          <p className="text-xs text-gray-500">
                            {expense.expenses.length} expense
                            {expense.expenses.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Expanded Individual Expenses */}
                {isExpanded && (
                  <div className="mt-2 ml-4 space-y-2">
                    {expense.expenses.map((individualExpense) => (
                      <Card
                        key={individualExpense.id}
                        className="shadow-sm bg-white border border-gray-200 rounded-[16px] hover:border-gray-300 transition-colors"
                      >
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {individualExpense.description ||
                                "No description"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(
                                individualExpense.created_at,
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <p
                            className="text-sm font-bold whitespace-nowrap ml-3"
                            style={{
                              background:
                                "linear-gradient(to right, #9333ea, #2563eb)",
                              WebkitTextFillColor: "transparent",
                              WebkitBackgroundClip: "text",
                            }}
                          >
                            ₹{individualExpense.amount}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Year Filter Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ExpenseFilters
          selectedYear={selectedYear}
          selectedCategory="All Categories"
          onYearChange={setSelectedYear}
          onCategoryChange={() => {}}
          onFilter={handleFilter}
          showCategoryFilter={false}
        />
      </div>
    </>
  );
};

export default MonthlyAnalysis;
