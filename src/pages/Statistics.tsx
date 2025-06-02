
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ResponsiveBar } from "@nivo/bar";
import { format, subMonths } from "date-fns";

interface MonthlyData {
  month: string;
  amount: number;
  expenses: number;
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

  const maxAmount = Math.max(...monthlyData.map(d => d.amount));

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
                <div className="h-[300px] w-full">
                  <ResponsiveBar
                    data={monthlyData}
                    keys={['amount']}
                    indexBy="month"
                    margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    colors={['#9333ea']}
                    borderRadius={4}
                    borderWidth={1}
                    borderColor={{
                      from: 'color',
                      modifiers: [['darker', 0.2]]
                    }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45,
                      legend: 'Month',
                      legendPosition: 'middle',
                      legendOffset: 50
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Amount (₹)',
                      legendPosition: 'middle',
                      legendOffset: -60,
                      format: (value) => `₹${value.toLocaleString('en-IN')}`
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor="#ffffff"
                    role="application"
                    ariaLabel="Monthly expense amount bar chart"
                    tooltip={({ id, value, color }) => (
                      <div className="bg-white p-2 shadow-lg rounded border">
                        <strong>₹{value.toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Number of Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveBar
                    data={monthlyData}
                    keys={['expenses']}
                    indexBy="month"
                    margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    colors={['#2563eb']}
                    borderRadius={4}
                    borderWidth={1}
                    borderColor={{
                      from: 'color',
                      modifiers: [['darker', 0.2]]
                    }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45,
                      legend: 'Month',
                      legendPosition: 'middle',
                      legendOffset: 50
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Count',
                      legendPosition: 'middle',
                      legendOffset: -40
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor="#ffffff"
                    role="application"
                    ariaLabel="Monthly expense count bar chart"
                    tooltip={({ id, value, color }) => (
                      <div className="bg-white p-2 shadow-lg rounded border">
                        <strong>{value} expenses</strong>
                      </div>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {monthlyData.map((data, index) => (
                <Card key={data.month}>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">{data.month}</p>
                      <p className="text-xl font-bold" style={{ background: "linear-gradient(to right, #9333ea, #2563eb)", WebkitTextFillColor: "transparent", WebkitBackgroundClip: "text" }}>
                        ₹{data.amount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-sm text-gray-500">{data.expenses} expenses</p>
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
