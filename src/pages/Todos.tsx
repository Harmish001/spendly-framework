import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Loader2,
  CheckSquare,
  Circle,
  Clock,
  CheckCircle2,
  ListTodo,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { TodoCard } from "@/components/todos/TodoCard";
import { TodoFormSheet } from "@/components/todos/TodoFormSheet";
import {
  TodoFilters,
  TodoStatusFilter,
  TodoPriorityFilter,
} from "@/components/todos/TodoFilters";
import { Todo, TodoStatus } from "@/components/todos/TodoForm";
import { SlideToConfirm } from "@/components/ui/SlideToConfirm";
import { BottomSheet } from "@/components/ui/BottomSheet";
import {
  GRADIENTS,
  getTextGradientStyle,
  getBackgroundGradientStyle,
} from "@/constants/theme";

const STATUS_TABS: {
  label: string;
  value: TodoStatusFilter;
  icon: React.FC<{ className?: string }>;
}[] = [
  { label: "All", value: "all", icon: ListTodo },
  { label: "Pending", value: "pending", icon: Circle },
  { label: "In Progress", value: "in_progress", icon: Clock },
  { label: "Completed", value: "completed", icon: CheckCircle2 },
];

const Todos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTodoSheetOpen, setIsTodoSheetOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);

  // Filter state
  const [activeStatusTab, setActiveStatusTab] =
    useState<TodoStatusFilter>("all");
  const [selectedStatus, setSelectedStatus] = useState<TodoStatusFilter>("all");
  const [selectedPriority, setSelectedPriority] =
    useState<TodoPriorityFilter>("all");
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("shortcut") === "add-todo") {
      setIsTodoSheetOpen(true);
      // Remove the parameter from the URL to avoid opening on every reload
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("shortcut");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    fetchTodos();
  }, [activeStatusTab, selectedStatus, selectedPriority]);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      // Status filter: active tab takes priority, then drawer filter
      const effectiveStatus =
        activeStatusTab !== "all" ? activeStatusTab : selectedStatus;
      if (effectiveStatus !== "all") {
        query = query.eq("status", effectiveStatus);
      }

      if (selectedPriority !== "all") {
        query = query.eq("priority", selectedPriority);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTodos((data as Todo[]) || []);
    } catch (error: any) {
      toast.error("Failed to fetch todos");
    } finally {
      setLoading(false);
    }
  };

  const handleTodoAdded = () => {
    fetchTodos();
    setIsTodoSheetOpen(false);
    setEditingTodo(null);
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsTodoSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("todos").delete().eq("id", id);
      if (error) throw error;
      toast.success("Todo deleted");
      setTodoToDelete(null);
      fetchTodos();
    } catch {
      toast.error("Failed to delete todo");
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    const newStatus: TodoStatus =
      todo.status === "completed" ? "pending" : "completed";
    try {
      const { error } = await supabase
        .from("todos")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", todo.id);
      if (error) throw error;
      toast.success(
        newStatus === "completed"
          ? "Marked as completed! 🎉"
          : "Moved back to pending",
      );
      fetchTodos();
    } catch {
      toast.error("Failed to update todo status");
    }
  };

  // Stats
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.status === "completed").length;
  const pendingCount = todos.filter((t) => t.status === "pending").length;
  const inProgressCount = todos.filter(
    (t) => t.status === "in_progress",
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pb-28 max-w-full overflow-x-hidden">
        {/* Page Title */}
        <div className="px-4 pt-4 pb-2">
          <h2
            className="text-2xl font-bold"
            style={getTextGradientStyle(GRADIENTS.PRIMARY)}
          >
            Todos
          </h2>
        </div>

        {/* Stats Row */}
        <div className="px-4 pb-2 grid grid-cols-3 gap-3">
          <div
            className="rounded-[18px] p-3 text-center"
            style={{
              background: "linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)",
            }}
          >
            <p className="text-xs text-amber-600 font-medium">Pending</p>
            <p
              className="text-2xl font-bold"
              style={getTextGradientStyle(GRADIENTS.PRIMARY)}
            >
              {pendingCount}
            </p>
          </div>
          <div
            className="rounded-[18px] p-3 text-center"
            style={{
              background: "linear-gradient(135deg, #e0e7ff 0%, #eff6ff 100%)",
            }}
          >
            <p className="text-xs text-blue-600 font-medium">In Progress</p>
            <p
              className="text-2xl font-bold"
              style={getTextGradientStyle(GRADIENTS.PRIMARY)}
            >
              {inProgressCount}
            </p>
          </div>
          <div
            className="rounded-[18px] p-3 text-center"
            style={{
              background: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)",
            }}
          >
            <p className="text-xs text-green-600 font-medium">Completed</p>
            <p
              className="text-2xl font-bold"
              style={getTextGradientStyle(GRADIENTS.PRIMARY)}
            >
              {completedCount}
            </p>
          </div>
        </div>

        {/* Horizontal Status Tabs */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {STATUS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeStatusTab === tab.value;
            return (
              <button
                key={tab.value}
                id={`status-tab-${tab.value}`}
                onClick={() => {
                  setActiveStatusTab(tab.value);
                  // Also sync the drawer filter
                  setSelectedStatus(tab.value);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 border ${
                  isActive
                    ? "text-white border-transparent shadow-md"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
                style={isActive ? { background: GRADIENTS.PRIMARY } : {}}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Todo List */}
        <div className="space-y-3 px-4">
          {loading ? (
            <div className="text-center py-12">
              <Loader2
                className="h-8 w-8 animate-spin mx-auto"
                style={{ color: "#f59e42" }}
              />
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
              >
                <CheckSquare className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-400 text-sm font-medium">
                No todos found
              </p>
              <p className="text-gray-300 text-xs">
                Tap the + button to add one!
              </p>
            </div>
          ) : (
            todos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onEdit={handleEdit}
                onDelete={(id) => setTodoToDelete(id)}
                onToggleComplete={handleToggleComplete}
              />
            ))
          )}
        </div>
      </div>

      {/* Floating Filter Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <TodoFilters
          selectedStatus={selectedStatus}
          selectedPriority={selectedPriority}
          onStatusChange={(v) => {
            setSelectedStatus(v);
            setActiveStatusTab(v);
          }}
          onPriorityChange={setSelectedPriority}
          onFilter={fetchTodos}
        />
      </div>

      {/* FAB: Add / Edit Todo */}
      <TodoFormSheet
        onTodoAdded={handleTodoAdded}
        isOpen={isTodoSheetOpen}
        onOpenChange={(open) => {
          setIsTodoSheetOpen(open);
          if (!open) setEditingTodo(null);
        }}
        editingTodo={editingTodo}
      />

      {/* Delete Confirmation Bottom Sheet */}
      <BottomSheet
        isOpen={!!todoToDelete}
        onOpenChange={() => setTodoToDelete(null)}
        title={
          <span className="text-xl font-bold text-red-600">🗑️ Delete Todo</span>
        }
        description={
          <>
            Confirm permanently delete this todo.
            <br />
            This action <strong>cannot</strong> be undone.
          </>
        }
      >
        <div className="pt-2">
          <SlideToConfirm
            variant="danger"
            label="Delete"
            onConfirm={() => {
              if (todoToDelete) handleDelete(todoToDelete);
            }}
          />
        </div>
      </BottomSheet>
    </div>
  );
};

export default Todos;
