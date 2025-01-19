import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatisticsCharts } from "@/components/statistics/StatisticsCharts";

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

        const chartData = Object.entries(categoryTotals).map(([category, amount]) => ({
          id: category.charAt(0).toUpperCase() + category.slice(1),
          label: category.charAt(0).toUpperCase() + category.slice(1),
          value: Number(amount),
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container py-4 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => navigate('/dashboard')}
            className="rounded-[16px]"
            style={{ background: "linear-gradient(to right, #ee9ca7, #ffdde1)" }}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
        
  );
};

export default Statistics;