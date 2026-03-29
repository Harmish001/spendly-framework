import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TodoForm, Todo } from "./TodoForm";
import { getBackgroundGradientStyle, GRADIENTS } from "@/constants/theme";

interface TodoFormSheetProps {
  onTodoAdded: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
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
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg text-white border-0 z-50"
          style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
          id="add-todo-fab"
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="rounded-t-[24px] border-0 max-h-[90vh]">
        <DrawerHeader className="text-center pb-2">
          <DrawerTitle className="text-lg font-semibold">
            {isEditing ? "Edit Todo" : "Add New Todo"}
          </DrawerTitle>
          {isEditing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
              <p className="text-sm text-blue-700 font-medium">
                ✏️ Editing todo — make your changes
              </p>
            </div>
          )}
        </DrawerHeader>

        <div className="px-6 pb-8 overflow-y-auto">
          <TodoForm
            onTodoAdded={onTodoAdded}
            editingTodo={editingTodo}
            onClose={() => onOpenChange?.(false)}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
