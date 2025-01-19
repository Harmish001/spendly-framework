import { ResponsivePie } from "@nivo/pie";
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
        <h2 className="text-2xl font-bold mb-6">Expense Distribution (3D Pie Chart)</h2>
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
            enableArcLinkLabels={true}
            arcLinkLabel={d => `${d.id} (₹${d.value})`}
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

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Expense Distribution (Bar Chart)</h2>
        <div className="h-[400px] w-full">
          <ResponsiveBar
            data={barData}
            keys={['amount']}
            indexBy="category"
            margin={{ top: 50, right: 50, bottom: 80, left: 80 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            colors={{ scheme: 'nivo' }}
            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: 'Category',
              legendPosition: 'middle',
              legendOffset: 60
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Amount (₹)',
              legendPosition: 'middle',
              legendOffset: -60
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20,
              }
            ]}
          />
        </div>
      </Card>
    </div>
  );
};