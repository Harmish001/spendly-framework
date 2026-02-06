import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  Wallet,
  Utensils,
  Car,
  ShoppingBag,
  BanknoteIcon,
  Stethoscope,
  LucidePlane,
  ScrollText,
  House,
} from "lucide-react";
import { toast } from "sonner";
import { MonthTabs } from "@/components/expenses/MonthTabs";
import { ExpenseFormSheet } from "@/components/expenses/ExpenseFormSheet";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { VoiceExpenseCapture } from "@/components/expenses/VoiceExpenseCapture";
import { AIExpenseCapture } from "@/components/expenses/AIExpenseCapture";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { DialogTitle } from "@/components/ui/dialog";
import { Header } from "@/components/layout/Header";
import { ResponsivePie } from "@nivo/pie";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { requestAllPermissions } from "../../Permissions";
import { Badge } from "@/components/ui/badge";
import {
  GRADIENTS,
  getTextGradientStyle,
  getBackgroundGradientStyle,
} from "@/constants/theme";

const categories = [
  { id: "investment", label: "Investment", icon: null },
  { id: "food", label: "Food and Dining", icon: null },
  { id: "transport", label: "Transportation", icon: null },
  { id: "shopping", label: "Shopping", icon: null },
  { id: "loan", label: "Loan", icon: null },
  { id: "medical", label: "Medical", icon: null },
  { id: "bill", label: "Bill", icon: null },
  { id: "travel", label: "Travel", icon: null },
  { id: "houseExpense", label: "House Expense", icon: null },
  { id: "others", label: "Others", icon: MoreHorizontal },
];

const categoryIcons = {
  investment: Wallet,
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  loan: BanknoteIcon,
  medical: Stethoscope,
  travel: LucidePlane,
  bill: ScrollText,
  others: MoreHorizontal,
  houseExpense: House,
};

const Dashboard = () => {
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const [isExpenseSheetOpen, setIsExpenseSheetOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear() + "",
  );
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(false);
  const [prefilledData, setPrefilledData] = useState<{
    amount: string;
    category: string;
    description: string;
    date?: string;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Categories");
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [isAction, setIsAction] = useState(null);
  const [translateX, setTranslateX] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipedCardId, setSwipedCardId] = useState<string | null>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const cardRef = useRef(null);

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (!prefilledData) return;
    setIsExpenseSheetOpen(true);
  }, [prefilledData]);

  useEffect(() => {
    // Add listener for shared expense events
    const handleSharedExpense = (event: CustomEvent) => {
      const expenseData = event.detail;
      setPrefilledData(expenseData);
    };

    window.addEventListener(
      "sharedExpenseProcessed",
      handleSharedExpense as EventListener,
    );

    return () => {
      window.removeEventListener(
        "sharedExpenseProcessed",
        handleSharedExpense as EventListener,
      );
    };
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (selectedMonth && selectedYear) {
        const startDate = `${selectedYear}-${selectedMonth.padStart(
          2,
          "0",
        )}-01`;
        const lastDay = new Date(
          parseInt(selectedYear),
          parseInt(selectedMonth),
          0,
        ).getDate();
        const endDate = `${selectedYear}-${selectedMonth.padStart(
          2,
          "0",
        )}-${lastDay}`;
        query = query.gte("created_at", startDate).lte("created_at", endDate);
      }

      if (selectedCategory !== "All Categories") {
        const categoryMapping: Record<string, string> = {
          Investment: "investment",
          "Food and Dining": "food",
          Transportation: "transport",
          Shopping: "shopping",
          Loan: "loan",
          Medical: "medical",
          Others: "others",
          HouseExpense: "houseExpense",
          Travel: "travel",
          Bill: "bill",
        };

        const mappedCategory = categoryMapping[selectedCategory];
        if (mappedCategory) {
          query = query.eq("category", mappedCategory);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setExpenses(data || []);

      const total = (data || []).reduce(
        (sum, expense) => sum + Number(expense.amount),
        0,
      );
      setTotalExpense(total);
    } catch (error) {
      console.error("Error fetching expenses:", error.message);
      toast.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = () => {
    fetchExpenses();
    setIsExpenseSheetOpen(false); // Close the sheet after expense is addedAdd commentMore actions
    setPrefilledData(null);
  };

  const clearPrefilledData = () => {
    setPrefilledData(null);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
  };

  const handleFilter = () => {
    fetchExpenses();
  };

  // const filteredExpenses = expenses.filter((expense) => {
  // 	if (selectedCategory === "All Categories") return true;
  // 	return (
  // 		expense.category === selectedCategory.toLowerCase().replace(/\s+/g, "")
  // 	);
  // });

  const getPieChartData = () => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((expense) => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += Number(expense.amount);
    });

    return Object.entries(categoryTotals).map(([category, value]) => ({
      id: category,
      label: category.charAt(0).toUpperCase() + category.slice(1),
      value,
    }));
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

      if (error) throw error;

      toast.success("Expense deleted successfully");
      fetchExpenses();
      setExpenseToDelete(null);
    } catch (error) {
      toast.error("Failed to delete expense");
    }
  };

  const SWIPE_THRESHOLD = 50;

  const handleTouchStart = (e, expenseId) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
    setSwipedCardId(expenseId);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    const deltaX = e.touches[0].clientX - startX;
    if (deltaX < 0) {
      setTranslateX(deltaX); // only allow left swipe
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (Math.abs(translateX) > SWIPE_THRESHOLD) {
      setTranslateX(-120); // show full delete button
    } else {
      setTranslateX(0);
      setSwipedCardId(null);
    }
  };

  useEffect(() => {
    if (!swipedCardId) return;

    const handleClickOutside = (event) => {
      const ref = cardRefs.current[swipedCardId];
      // Check if click is on the Remove button
      const removeBtn = document.getElementById(`delete_${swipedCardId}`);
      if (
        ref &&
        !ref.contains(event.target) &&
        (!removeBtn || !removeBtn.contains(event.target))
      ) {
        setTranslateX(0);
        setSwipedCardId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [swipedCardId]);

  // const handleDelete = () => {
  //   setTimeout(() => {
  //     onDelete(expense.id);
  //   }, 300); // delay for animation
  // };

  useEffect(() => {
    // Optional: Auto-request permissions when app starts
    const autoRequestPermissions = async () => {
      try {
        console.log("🚀 App started - requesting permissions...");
        const result = await requestAllPermissions();
      } catch (error) {
        console.error("❌ Auto permission request failed:", error);
      }
    };

    // Uncomment the line below if you want to auto-request on app start
    autoRequestPermissions();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pb-20 md:pb-8 max-w-full overflow-x-hidden">
        {/* Month Navigation */}
        <div className="w-full overflow-hidden">
          <MonthTabs
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>

        {/* AI Expense Capture */}
        <div className="px-4 py-0">
          <AIExpenseCapture onExpenseExtracted={setPrefilledData} />
        </div>

        {/* Add Expense Button */}
        <div className="px-4 pb-0">
          <ExpenseFormSheet
            onExpenseAdded={handleExpenseAdded}
            prefilledData={prefilledData}
            onClearPrefilled={clearPrefilledData}
            isOpen={isExpenseSheetOpen}
            onOpenChange={setIsExpenseSheetOpen}
          />
        </div>

        {/* Total Expense Card */}
        <div className="px-4 pb-0">
          <Card className="col-span-1 md:col-span-2 mb-2 mt-2 border-0 shadow-none">
            <CardContent className="p-1">
              <div className="relative h-[250px] ">
                <ResponsivePie
                  data={getPieChartData()}
                  margin={{ top: 0, right: 20, bottom: 10, left: 20 }}
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
                  borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                  enableArcLinkLabels={false}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{
                    from: "color",
                    modifiers: [["brighter", 3]],
                  }}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <p className="text-sm font-bold text-gray-500">Total</p>
                  <p
                    className="text-2xl font-bold"
                    style={getTextGradientStyle(GRADIENTS.PRIMARY)}
                  >
                    ₹{totalExpense.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense List */}
        <div className="space-y-3 px-4">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No expenses found for the selected month.
            </div>
          ) : (
            expenses.map((expense) => {
              const category = categories.find(
                (cat) => cat.id === expense.category,
              );
              const Icon = category?.icon || MoreHorizontal;
              const CategoryIcon =
                categoryIcons[expense.category] || MoreHorizontal;

              return (
                <div className="relative overflow-hidden shadow-md rounded-[20px]">
                  {/* Red delete background */}
                  {/* <div className="absolute inset-[10px] flex justify-end items-center bg-red-600 pr-6 rounded-[20px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteExpense(expense.id);
                      }}
                      className="text-white font-semibold text-sm"
                      id={`delete_${expense.id}`}
                    >
                      <Trash2 className="w-5 h-5 inline mr-1" />
                      Remove
                    </button>
                  </div> */}
                  {/* <div
                    ref={(el) => (cardRefs.current[expense.id] = el)}
                    className={
                      "transition-transform duration-300 touch-pan-x shadow-md"
                    }
                    style={{
                      transform:
                        swipedCardId === expense.id
                          ? `translateX(${translateX}px)`
                          : "translateX(0px)",
                    }}
                  onTouchStart={(e) => handleTouchStart(e, expense.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  > */}
                  <Card
                    key={expense.id}
                    className="shadow-md from-white to-gray-50/50 border rounded-[20px] hover:border-gray-300 transition-colors overflow-hidden"
                    onClick={() => setIsAction(expense)}
                  >
                    <CardContent className="flex items-center justify-between p-5">
                      <div className="flex items-center justify-center gap-3 flex-1 min-w-0">
                        <div
                          className="p-2 rounded-[14px] shrink-0"
                          style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
                        >
                          <CategoryIcon className="h-7 w-7 text-white" />
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <p className="font-muted truncate font-semibold text-sm">
                            {expense.description || "No description"}
                          </p>
                          <p className="text-xs text-gray-600 ">
                            {new Date(expense.created_at).getDate()}&nbsp;
                            {new Date(expense.created_at).toLocaleString(
                              "default",
                              { month: "long" },
                            )}
                          </p>
                        </div>

                        <div className="flex items-end gap-1 shrink-0 flex-col">
                          <p
                            className="text-base font-bold whitespace-nowrap"
                            style={getTextGradientStyle(GRADIENTS.PRIMARY)}
                          >
                            ₹{expense.amount}
                          </p>
                          <Badge
                            variant="secondary"
                            className="text-xs font-medium text-white hover:bg-gray-200"
                            style={getBackgroundGradientStyle(
                              GRADIENTS.PRIMARY,
                            )}
                          >
                            {category?.label || expense.category}
                          </Badge>
                        </div>
                        <div className="flex items-center flex-col justify-center">
                          <Edit
                            className="h-5 w-5 mb-2 text-gray-500"
                            onClick={() => handleEditExpense(expense)}
                          />
                          <Trash2
                            className="h-5 w-5 text-red-600"
                            onClick={() => setExpenseToDelete(expense.id)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* </div> */}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Voice Expense Capture - positioned for mobile visibility */}
      {/*<div className="fixed bottom-32 left-4 z-50">
        <VoiceExpenseCapture onExpenseExtracted={setPrefilledData} />
      </div>*/}

      {/* Expense Filters */}
      <div className="fixed bottom-24 right-6 z-50">
        <ExpenseFilters
          selectedYear={selectedYear}
          selectedCategory={selectedCategory}
          onYearChange={setSelectedYear}
          onCategoryChange={setSelectedCategory}
          onFilter={handleFilter}
        />
      </div>

      {/* Mobile Navigation */}
      {/* <MobileNavigation /> */}

      {/* Edit Expense Dialog */}
      {editingExpense && (
        <Drawer
          open={!!editingExpense}
          onOpenChange={() => setEditingExpense(null)}
        >
          <DrawerContent className="sm:max-w-[425px] px-3">
            <DrawerHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DrawerHeader>
            <ExpenseForm
              onExpenseAdded={() => {
                handleExpenseAdded();
                setEditingExpense(null);
              }}
              editingExpense={editingExpense}
            />
          </DrawerContent>
        </Drawer>
      )}
      <Drawer
        open={!!expenseToDelete}
        onOpenChange={() => setExpenseToDelete(null)}
      >
        <DrawerContent>
          <DrawerHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DrawerDescription>
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button
              className="rounded-[24px] bg-danger"
              style={{ background: "red" }}
              onClick={() => handleDeleteExpense(expenseToDelete)}
            >
              Delete
            </Button>
            <DrawerClose className="rounded-[24px]">Cancel</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Dashboard;
