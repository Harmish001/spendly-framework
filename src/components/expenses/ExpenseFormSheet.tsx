import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
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

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg text-white border-0 hover:from-purple-600 hover:to-blue-600 z-50"
          style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="rounded-t-[24px] border-0 max-h-[85vh]">
        <DrawerHeader className="text-center pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold">
              {isEditing ? "Edit Expense" : "Add New Expense"}
            </DrawerTitle>
            {(prefilledData || isEditing) && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearPrefilled}
                className="text-xs rounded-full"
              >
                Clear
              </Button>
            )}
          </div>

          {prefilledData && !isEditing && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2">
              <p className="text-sm text-purple-700 font-medium">
                ✨ AI extracted data - Review and confirm
              </p>
            </div>
          )}

          {isEditing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
              <p className="text-sm text-blue-700 font-medium">
                ✏️ Editing expense - Make your changes
              </p>
            </div>
          )}
        </DrawerHeader>

        <div className="px-6 pb-8 overflow-y-auto">
          <ExpenseForm
            onExpenseAdded={onExpenseAdded}
            prefilledData={prefilledData}
            onClearPrefilled={onClearPrefilled}
            editingExpense={editingExpense}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
