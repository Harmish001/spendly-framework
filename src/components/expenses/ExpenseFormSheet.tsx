import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ExpenseForm } from "./ExpenseForm";

interface ExpenseFormSheetProps {
  onExpenseAdded: () => void;
}

export const ExpenseFormSheet = ({ onExpenseAdded }: ExpenseFormSheetProps) => {
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
          <h2 className="text-lg font-semibold">Add New Expense</h2>
          <ExpenseForm onExpenseAdded={onExpenseAdded} />
        </div>
      </SheetContent>
    </Sheet>
  );
};