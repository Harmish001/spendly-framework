import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Plane, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { MonthTabs } from "@/components/expenses/MonthTabs";
import { ResponsivePie } from "@nivo/pie";

const TravelExpenses = () => {
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear() + "",
  );
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTravelExpenses();
  }, [selectedMonth, selectedYear]);

  const fetchTravelExpenses = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("expenses")
        .select("*")
        .eq("category", "travel")
        .order("created_at", { ascending: false });

      if (selectedMonth && selectedYear) {
        const startDate = `${selectedYear}-${selectedMonth.padStart(2, "0")}-01`;
        const lastDay = new Date(
          parseInt(selectedYear),
          parseInt(selectedMonth),
          0,
        ).getDate();
        const endDate = `${selectedYear}-${selectedMonth.padStart(2, "0")}-${lastDay}`;
        query = query.gte("created_at", startDate).lte("created_at", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      setExpenses(data || []);

      const total = (data || []).reduce(
        (sum, expense) => sum + Number(expense.amount),
        0,
      );
      setTotalExpense(total);
    } catch (error: any) {
      console.error("Error fetching travel expenses:", error.message);
      toast.error("Failed to fetch travel expenses");
    } finally {
      setLoading(false);
    }
  };

  const getPieChartData = () => {
    const descriptions: Record<string, number> = {};
    expenses.forEach((expense) => {
      const desc = expense.description || "No description";
      if (!descriptions[desc]) {
        descriptions[desc] = 0;
      }
      descriptions[desc] += Number(expense.amount);
    });

    return Object.entries(descriptions).map(([description, value]) => ({
      id: description,
      label: description,
      value,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold">Travel Expenses</h1>
          </div>
        </div>
      </div>

      <div className="pb-4 md:pb-8 max-w-full overflow-x-hidden">
        <div className="w-full overflow-hidden">
          <MonthTabs
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>

        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <Card className="col-span-1 md:col-span-2 mb-4 mt-2 border-0 shadow-none">
              <CardContent className="p-1">
                <div className="relative h-[250px]">
                  {expenses.length > 0 ? (
                    <ResponsivePie
                      data={getPieChartData()}
                      margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                      innerRadius={0.6}
                      padAngle={0.7}
                      cornerRadius={3}
                      activeOuterRadiusOffset={8}
                      colors={[
                        "#f59e42", // Start - warm orange
                        "#f7934d",
                        "#f98858",
                        "#fb7d63",
                        "#fd726e",
                        "#ff6b6b", // End - coral/rose
                      ]}
                      borderWidth={1}
                      borderColor={{
                        from: "color",
                        modifiers: [["darker", 0.2]],
                      }}
                      enableArcLinkLabels={false}
                      arcLabelsSkipAngle={10}
                      arcLabelsTextColor={{
                        from: "color",
                        modifiers: [["darker", 2]],
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No travel expenses found</p>
                    </div>
                  )}
                  {expenses.length > 0 && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                      <p className="text-sm">Travel Total</p>
                      <p
                        className="text-2xl font-bold"
                        style={{
                          background:
                            "linear-gradient(135deg, #f59e42 0%, #ff6b6b 100%)",
                          WebkitTextFillColor: "transparent",
                          WebkitBackgroundClip: "text",
                        }}
                      >
                        ₹{totalExpense.toLocaleString("en-IN")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 container">
              {expenses.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No travel expenses found for the selected month.
                </div>
              ) : (
                expenses.map((expense) => (
                  <Card
                    key={expense.id}
                    className="border rounded-[24px] hover:border-gray-300 transition-colors overflow-hidden"
                  >
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                          className="p-2 rounded-[24px] shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, #f59e42 0%, #ff6b6b 100%)",
                          }}
                        >
                          <Plane className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <p className="font-semibold truncate">
                            {expense.description || "No description"}
                          </p>
                          <p className="text-sm capitalize">Travel</p>
                          <p className="text-xs">
                            {new Date(expense.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <p
                            className="text-xl font-bold whitespace-nowrap"
                            style={{
                              background:
                                "linear-gradient(135deg, #f59e42 0%, #ff6b6b 100%)",
                              WebkitTextFillColor: "transparent",
                              WebkitBackgroundClip: "text",
                            }}
                          >
                            ₹{expense.amount}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TravelExpenses;
