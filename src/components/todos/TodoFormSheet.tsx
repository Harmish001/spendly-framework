import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TodoForm, Todo } from "./TodoForm";
import { getBackgroundGradientStyle, GRADIENTS } from "@/constants/theme";

interface TodoFormSheetProps {
  onTodoAdded: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingTodo?: Todo | null;
}

export const TodoFormSheet = ({
  onTodoAdded,
  isOpen,
  onOpenChange,
  editingTodo,
}: TodoFormSheetProps) => {
  const isEditing = !!editingTodo;

  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Todo" : "Add New Todo"}
      trigger={
        <Button
          variant="outline"
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-white border-0 z-50 flex items-center justify-center p-0"
          style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
          id="add-todo-fab"
        >
          <PlusCircle className="h-7 w-7" />
        </Button>
      }
    >
      <div className="space-y-4">
        {isEditing && (
          <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 transition-all animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm text-blue-700 font-semibold flex items-center gap-2">
              <span className="text-lg">✏️</span>
              Editing todo — make your changes
            </p>
          </div>
        )}

        <TodoForm
          onTodoAdded={onTodoAdded}
          editingTodo={editingTodo}
          onClose={() => onOpenChange(false)}
        />
      </div>
    </BottomSheet>
  );
};
