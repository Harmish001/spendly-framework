"use client";

import { useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { Header } from "@/components/layout/Header";
import {
  BanknoteIcon, Car, ChevronDown, ChevronUp, Loader2, LucidePlane,
  MoreHorizontal, ScrollText, ShoppingBag, Stethoscope, Utensils, Wallet, House,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MonthTabs } from "@/components/expenses/MonthTabs";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { GRADIENTS, getTextGradientStyle, getBackgroundGradientStyle } from "@/lib/constants/theme";

const categoryIcons: Record<string, React.ElementType> = {
  investment: Wallet, food: Utensils, transport: Car, shopping: ShoppingBag,
  loan: BanknoteIcon, medical: Stethoscope, travel: LucidePlane, bill: ScrollText,
  houseExpense: House, others: MoreHorizontal,
};

const categoryLabels: Record<string, string> = {
  investment: "Investment", food: "Food and Dining", transport: "Transportation",
  shopping: "Shopping", loan: "Loan", medical: "Medical", bill: "Bill",
  travel: "Travel", houseExpense: "House Expense", others: "Others",
};

interface CategoryExpense {
  category: string;
  total: number;
  expenses: { _id: string; category: string; amount: number | string; description?: string | null; createdAt: string | Date }[];
}

function groupByCategory(data: { _id: string; category: string; amount: number | string; description?: string | null; createdAt: string | Date }[]): CategoryExpense[] {
  const result: Record<string, { total: number; expenses: { _id: string; category: string; amount: number | string; description?: string | null; createdAt: string | Date }[] }> = {};
  data.forEach((expense) => {
    const { category, amount } = expense;
    if (!result[category]) result[category] = { total: 0, expenses: [] };
    result[category].total += Number(amount);
    result[category].expenses.push(expense);
  });
  return Object.entries(result).map(([category, d]) => ({ category, total: d.total, expenses: d.expenses }));
}

export default function MonthlyAnalysisPage() {
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + "");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const { expenses: rawExpenses, totalExpense, isLoading } = useExpenses({ month: selectedMonth, year: selectedYear });

  // Group expenses by category (client-side)
  const groupedExpenses = groupByCategory(rawExpenses);

  return (
    <>
      <div style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}>
        <Header isTransparent />
        <div className="pt-8 px-4" style={{ marginBottom: "-1px", marginTop: "-2px" }}>
          <h1 className="text-2xl font-bold mb-2 text-white flex justify-center">Monthly Analysis</h1>
          <p className="text-2xl font-bold text-white flex justify-center">
            ₹{totalExpense.toLocaleString("en-IN")}
          </p>
        </div>
        <MonthTabs selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} isTransparent />
      </div>

      <p className="text-2xl font-bold mt-2 ml-8 mb-3" style={getTextGradientStyle(GRADIENTS.PRIMARY)}>Expenses</p>

      {isLoading && (
        <div className="w-full flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-amber-700" />
        </div>
      )}

      {!isLoading && (
        <div className="space-y-3 px-4 pt-2 pb-24">
          {groupedExpenses.map((expense) => {
            const CategoryIcon = categoryIcons[expense.category] || MoreHorizontal;
            const isExpanded = expandedCategory === expense.category;
            return (
              <div key={expense.category}>
                <Card
                  className="shadow-md bg-gradient-to-r from-white to-gray-50/50 border rounded-[20px] hover:border-gray-300 transition-colors overflow-hidden cursor-pointer"
                  onClick={() => setExpandedCategory(isExpanded ? null : expense.category)}
                >
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-[14px] shrink-0" style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}>
                          <CategoryIcon className="h-7 w-7 text-white" />
                        </div>
                        <p className="font-semibold truncate text-sm">{categoryLabels[expense.category] || expense.category}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-end gap-1 flex-col">
                          <p className="text-base font-bold whitespace-nowrap" style={getTextGradientStyle(GRADIENTS.PRIMARY)}>₹{expense.total.toLocaleString("en-IN")}</p>
                          <p className="text-xs text-gray-500">{expense.expenses.length} expense{expense.expenses.length !== 1 ? "s" : ""}</p>
                        </div>
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {isExpanded && (
                  <div className="mt-2 ml-4 space-y-2">
                    {expense.expenses.map((individualExpense) => (
                      <Card key={individualExpense._id} className="shadow-sm bg-white border border-gray-200 rounded-[16px] hover:border-gray-300 transition-colors">
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{individualExpense.description || "No description"}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(individualExpense.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                          <p className="text-sm font-bold whitespace-nowrap ml-3" style={getTextGradientStyle(GRADIENTS.PRIMARY)}>
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

      {/* Year Filter */}
      <div className="fixed bottom-6 right-6 z-50">
        <ExpenseFilters
          selectedYear={selectedYear}
          selectedCategory="All Categories"
          onYearChange={setSelectedYear}
          onCategoryChange={() => {}}
          onFilter={() => {}}
          showCategoryFilter={false}
        />
      </div>
    </>
  );
}
