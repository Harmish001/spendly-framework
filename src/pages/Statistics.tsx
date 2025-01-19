import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet } from "lucide-react";
import { ResponsivePie } from "@nivo/pie";
import { Loader2 } from "lucide-react";

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
          id: category.charAt(0).toUpperCase() + category.slice(1),
          label: category.charAt(0).toUpperCase() + category.slice(1),
          value: Number(((Number(amount) / totalAmount) * 100).toFixed(2)),
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Spendly
          </h1>
          <Button
            onClick={() => navigate('/dashboard')}
            className="rounded-[16px]"
            style={{ background: "linear-gradient(to right, #ee9ca7, #ffdde1)" }}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-8 flex-1">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Monthly Expenses Distribution</h2>
            <div className="h-[400px] w-full">
              <ResponsivePie
                data={data}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={{ scheme: 'nivo' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                legends={[
                  {
                    anchor: 'bottom',
                    direction: 'row',
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 0,
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: '#999',
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: 'circle',
                  }
                ]}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Statistics;