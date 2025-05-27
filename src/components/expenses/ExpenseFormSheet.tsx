
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ExpenseForm } from "./ExpenseForm";

interface ExpenseFormSheetProps {
  onExpenseAdded: () => void;
  prefilledData?: {
    amount: string;
    category: string;
    description: string;
    date?: string;
  } | null;
  onClearPrefilled?: () => void;
}

export const ExpenseFormSheet = ({ 
  onExpenseAdded, 
  prefilledData, 
  onClearPrefilled 
}: ExpenseFormSheetProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="md:hidden rounded-[20px]"
          style={{
            background: "linear-gradient(to right, #9333ea, #2563eb)",
            color: "white"
          }}
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add Expense
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Add New Expense</h2>
            {prefilledData && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearPrefilled}
                className="text-xs"
              >
                Clear
              </Button>
            )}
          </div>
          
          {prefilledData && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-700 font-medium">
                ✨ AI extracted data - Review and confirm
              </p>
            </div>
          )}
          
          <ExpenseForm 
            onExpenseAdded={onExpenseAdded} 
            prefilledData={prefilledData}
            onClearPrefilled={onClearPrefilled}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
