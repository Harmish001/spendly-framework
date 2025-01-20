import { ResponsiveBar } from "@nivo/bar";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ChartData {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface StatisticsChartsProps {
  data: ChartData[];
  loading: boolean;
}

export const StatisticsCharts = ({ data, loading }: StatisticsChartsProps) => {
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const barData = data.map(item => ({
    category: item.label,
    amount: item.value
  }));

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Expense Distribution</h2>
        <div className="h-[300px] w-full">
          <ResponsiveBar
            data={barData}
            keys={['amount']}
            indexBy="category"
            margin={{ top: 30, right: 30, bottom: 50, left: 60 }}
            padding={0.2}
            valueScale={{ type: 'linear' }}
            colors={[
              'linear-gradient(225deg, #FFE29F 0%, #FFA99F 48%, #FF719A 100%)'
            ]}
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
              legend: 'Category',
              legendPosition: 'middle',
              legendOffset: 40
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Amount (₹)',
              legendPosition: 'middle',
              legendOffset: -40
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="#ffffff"
            role="application"
            ariaLabel="Expense distribution bar chart"
          />
        </div>
      </Card>
    </div>
  );
};