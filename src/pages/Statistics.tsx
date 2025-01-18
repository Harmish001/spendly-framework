import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Statistics = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: expenses, error } = await supabase
          .from("expenses")
          .select("category, amount");

        if (error) throw error;

        const categoryTotals = expenses.reduce((acc: Record<string, number>, curr) => {
          const category = curr.category;
          if (!acc[category]) {
            acc[category] = 0;
          }
          acc[category] += Number(curr.amount);
          return acc;
        }, {});

        const totalAmount = Object.values(categoryTotals).reduce((a, b) => Number(a) + Number(b), 0);

        const chartData = Object.entries(categoryTotals).map(([category, amount]) => ({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          value: Number(((Number(amount) / totalAmount) * 100).toFixed(2))
        }));

        setData(chartData);
      } catch (error: any) {
        console.error("Error fetching expenses:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wallet className="h-8 w-8" />
              Spendly
            </h1>
            <Button
              onClick={() => navigate('/dashboard')}
              className="rounded-[16px]"
              style={{ background: "linear-gradient(to right, #243949 0%, #517fa4 100%)" }}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Monthly Expenses Distribution</h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Statistics;