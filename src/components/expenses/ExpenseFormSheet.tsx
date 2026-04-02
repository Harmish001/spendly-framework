import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ExpenseForm } from "./ExpenseForm";
import { getBackgroundGradientStyle, GRADIENTS } from "@/constants/theme";

interface ExpenseFormSheetProps {
  onExpenseAdded: () => void;
  prefilledData?: {
    amount: string;
    category: string;
    description: string;
    date?: string;
  } | null;
  onClearPrefilled?: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingExpense?: {
    id: string;
    amount: number;
    category: string;
    description: string;
    created_at: string;
    date: string;
  } | null;
}

export const ExpenseFormSheet = ({
  onExpenseAdded,
  prefilledData,
  onClearPrefilled,
  isOpen,
  onOpenChange,
  editingExpense,
}: ExpenseFormSheetProps) => {
  const isEditing = !!editingExpense;

  const headerExtras = (prefilledData || isEditing) && (
    <Button
      variant="outline"
      size="sm"
      onClick={onClearPrefilled}
      className="text-xs rounded-full h-8"
    >
      Clear
    </Button>
  );

  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={
        <div className="relative flex items-center justify-center w-full">
          <span className="text-xl font-bold">
            {isEditing ? "Edit Expense" : "Add New Expense"}
          </span>
          {headerExtras && (
            <div className="absolute right-0">
              {headerExtras}
            </div>
          )}
        </div>
      }
      trigger={
        <Button
          variant="outline"
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-white border-0 z-50 flex items-center justify-center p-0"
          style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
        >
          <PlusCircle className="h-7 w-7" />
        </Button>
      }
    >
      <div className="space-y-4">
        {prefilledData && !isEditing && (
          <div className="bg-purple-50/80 border border-purple-100 rounded-2xl p-4 transition-all animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm text-purple-700 font-semibold flex items-center gap-2">
              <span className="text-lg">✨</span>
              AI extracted data - Review and confirm
            </p>
          </div>
        )}

        {isEditing && (
          <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 transition-all animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm text-blue-700 font-semibold flex items-center gap-2">
              <span className="text-lg">✏️</span>
              Editing expense - Make your changes
            </p>
          </div>
        )}

        <ExpenseForm
          onExpenseAdded={onExpenseAdded}
          prefilledData={prefilledData}
          onClearPrefilled={onClearPrefilled}
          editingExpense={editingExpense}
        />
      </div>
    </BottomSheet>
  );
};
