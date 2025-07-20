import React, { useEffect, useState } from "react";
import { Header } from "../layout/Header";
import { supabase } from "@/integrations/supabase/client";
import {
  BanknoteIcon,
  Car,
  Loader2,
  LucidePlane,
  MoreHorizontal,
  ScrollText,
  ShoppingBag,
  Stethoscope,
  Utensils,
  Wallet,
  House
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { MonthTabs } from "../expenses/MonthTabs";

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

function groupByCategory(data) {
  const result = {};

  data.forEach(({ category, amount }) => {
    if (!result[category]) {
      result[category] = 0;
    }
    result[category] += amount;
  });

  return Object.entries(result).map(([category, total]) => ({
    category,
    total,
  }));
}

type AnalysisType = "Monthly" | "Yearly" | "Weekly";
const MonthlyAnalysis = () => {
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const [analysisType, setAnalysisType] = useState<AnalysisType>("Monthly");
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });
      const selectedYear = new Date().getFullYear() + "";
      if (selectedMonth && selectedYear) {
        const startDate = `${selectedYear}-${selectedMonth.padStart(
          2,
          "0"
        )}-01`;
        const lastDay = new Date(
          parseInt(selectedYear),
          parseInt(selectedMonth),
          0
        ).getDate();
        const endDate = `${selectedYear}-${selectedMonth.padStart(
          2,
          "0"
        )}-${lastDay}`;
        query = query.gte("created_at", startDate).lte("created_at", endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      const categoryData = groupByCategory(data || []);
      setExpenses(categoryData || []);
      const total = (data || []).reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
      );
      setTotalExpense(total);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth]);

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
      <MonthTabs selectedMonth={selectedMonth} onMonthChange={(value) => setSelectedMonth(value)} />
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
        <div className="space-y-3 px-4 pt-2">
          {expenses.map((expense) => {
            const CategoryIcon = categoryIcons[expense.category];
            return (
              <Card className="shadow-md bg-gradient-to-r from-white to-gray-50/50 border rounded-[20px] hover:border-gray-300 transition-colors overflow-hidden">
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
                          categories.find((item) => item.id == expense.category)
                            .label
                        }
                      </p>
                    </div>
                    <div className="flex items-end gap-1 shrink-0 flex-col">
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
};

export default MonthlyAnalysis;
