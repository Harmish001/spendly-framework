
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
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ExpenseFormSheet = ({
  onExpenseAdded,
  prefilledData,
  onClearPrefilled,
  isOpen,
  onOpenChange
}: ExpenseFormSheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600 z-50"
        >
          <PlusCircle className="h-6 w-6" />
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
