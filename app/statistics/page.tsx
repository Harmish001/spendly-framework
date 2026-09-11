"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { format, subMonths } from "date-fns";
import { getBackgroundGradientStyle, GRADIENTS } from "@/lib/constants/theme";

interface MonthlyData {
  month: string;
  amount: number;
  expenses: number;
  [key: string]: string | number;
}

export default function StatisticsPage() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => { fetchStatistics(); }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const currentDate = new Date();
      const months: MonthlyData[] = [];

      for (let i = 5; i >= 0; i--) {
        const date = subMonths(currentDate, i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthStr = month.toString().padStart(2, "0");

        const params = new URLSearchParams({ month: monthStr, year: year.toString() });
        const res = await fetch(`/api/expenses?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        const totalAmount = (data.expenses || []).reduce(
          (sum: number, e: { amount: number | string }) => sum + Number(e.amount), 0
        );

        months.push({
          month: format(date, "MMM yyyy"),
          amount: totalAmount,
          expenses: data.expenses?.length || 0,
        });
      }
      setMonthlyData(months);
    } catch {
      toast.error("Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    amount: { label: "Amount", color: "#fbbf24" },
    expenses: { label: "Expenses", color: "#f97316" },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b px-4 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="rounded-full">
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-white" />
            <h1 className="text-xl text-white font-bold">Statistics</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
              {monthlyData.map((data) => (
                <Card key={data.month} className="p-3 rounded-[20px] shadow-md bg-gradient-to-r from-white to-gray-50/50">
                  <CardContent className="p-0">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">{data.month}</p>
                      <p className="text-lg font-bold mb-1" style={{ ...getBackgroundGradientStyle(GRADIENTS.PRIMARY), WebkitTextFillColor: "transparent", WebkitBackgroundClip: "text" }}>
                        ₹{data.amount.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-gray-500">{data.expenses} expenses</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="rounded-[20px] hover:shadow-lg shadow-md bg-gradient-to-r from-white to-gray-50/50">
              <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold">Monthly Expense Amount</CardTitle></CardHeader>
              <CardContent className="p-2">
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`} />
                      <ChartTooltip content={<ChartTooltipContent />} formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Amount"]} />
                      <Bar dataKey="amount" fill="var(--color-amount)" radius={[6, 6, 0, 0]} stroke="none" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="rounded-[20px] hover:shadow-lg shadow-md bg-gradient-to-r from-white to-gray-50/50">
              <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold">Number of Expenses</CardTitle></CardHeader>
              <CardContent className="p-2">
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                      <ChartTooltip content={<ChartTooltipContent />} formatter={(value) => [`${value}`, "Expenses"]} />
                      <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[6, 6, 0, 0]} stroke="none" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
