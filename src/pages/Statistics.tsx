import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Statistics = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: expenses, error } = await supabase
          .from("expenses")
          .select("category, amount");

        if (error) throw error;

        // Group expenses by category and calculate total
        const categoryTotals = expenses.reduce((acc: any, curr: any) => {
          const category = curr.category;
          if (!acc[category]) {
            acc[category] = 0;
          }
          acc[category] += Number(curr.amount);
          return acc;
        }, {});

        // Calculate total amount
        const totalAmount = Object.values(categoryTotals).reduce((a: any, b: any) => a + b, 0);

        // Convert to percentage and format for pie chart
        const chartData = Object.entries(categoryTotals).map(([category, amount]: [string, any]) => ({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          value: Number(((amount / totalAmount) * 100).toFixed(2))
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Monthly Expenses Distribution</h1>
      <Card className="p-6">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
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
  );
};

export default Statistics;