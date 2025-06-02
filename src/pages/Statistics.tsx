
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { format, subMonths } from "date-fns";

interface MonthlyData {
  month: string;
  amount: number;
  expenses: number;
  [key: string]: string | number; // Index signature for BarDatum compatibility
}

const Statistics = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const currentDate = new Date();
      const months = [];
      
      // Get last 3 months including current month
      for (let i = 2; i >= 0; i--) {
        const date = subMonths(currentDate, i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthStr = month.toString().padStart(2, '0');
        const startDate = `${year}-${monthStr}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${monthStr}-${lastDay}`;

        const { data, error } = await supabase
          .from("expenses")
          .select("amount")
          .gte("created_at", startDate)
          .lte("created_at", endDate);

        if (error) throw error;

        const totalAmount = (data || []).reduce((sum, expense) => sum + Number(expense.amount), 0);
        const expenseCount = data?.length || 0;

        months.push({
          month: format(date, 'MMM yyyy'),
          amount: totalAmount,
          expenses: expenseCount
        });
      }

      setMonthlyData(months);
    } catch (error: any) {
      console.error("Error fetching statistics:", error.message);
      toast.error("Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    amount: {
      label: "Amount",
      color: "#9333ea",
    },
    expenses: {
      label: "Expenses",
      color: "#2563eb",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <h1 className="text-xl font-bold">Statistics</h1>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Monthly Expense Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#666' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#666' }}
                        tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                      />
                      <Bar 
                        dataKey="amount" 
                        fill="var(--color-amount)"
                        radius={[4, 4, 0, 0]}
                        stroke="none"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Number of Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#666' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#666' }}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value) => [`${value}`, 'Expenses']}
                      />
                      <Bar 
                        dataKey="expenses" 
                        fill="var(--color-expenses)"
                        radius={[4, 4, 0, 0]}
                        stroke="none"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {monthlyData.map((data, index) => (
                <Card key={data.month} className="p-3">
                  <CardContent className="p-0">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">{data.month}</p>
                      <p className="text-lg font-bold mb-1" style={{ background: "linear-gradient(to right, #9333ea, #2563eb)", WebkitTextFillColor: "transparent", WebkitBackgroundClip: "text" }}>
                        ₹{data.amount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-500">{data.expenses} expenses</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Statistics;
