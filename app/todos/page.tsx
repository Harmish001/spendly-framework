"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckSquare, Circle, Clock, CheckCircle2, ListTodo } from "lucide-react";
import { useTodos } from "@/hooks/useTodos";
import { Header } from "@/components/layout/Header";
import { TodoCard } from "@/components/todos/TodoCard";
import { TodoFormSheet } from "@/components/todos/TodoFormSheet";
import { TodoFilters, TodoStatusFilter, TodoPriorityFilter } from "@/components/todos/TodoFilters";
import { Todo } from "@/hooks/useTodos";
import { SlideToConfirm } from "@/components/ui/SlideToConfirm";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { GRADIENTS, getTextGradientStyle, getBackgroundGradientStyle } from "@/lib/constants/theme";

const STATUS_TABS: { label: string; value: TodoStatusFilter; icon: React.ElementType }[] = [
  { label: "All", value: "all", icon: ListTodo },
  { label: "Pending", value: "pending", icon: Circle },
  { label: "In Progress", value: "in_progress", icon: Clock },
  { label: "Completed", value: "completed", icon: CheckCircle2 },
];

export default function TodosPage() {
  const searchParams = useSearchParams();
  const [isTodoSheetOpen, setIsTodoSheetOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [activeStatusTab, setActiveStatusTab] = useState<TodoStatusFilter>("all");
  const [selectedStatus, setSelectedStatus] = useState<TodoStatusFilter>("all");
  const [selectedPriority, setSelectedPriority] = useState<TodoPriorityFilter>("all");

  const { todos, isLoading, removeTodo, isRemoving, editTodo } = useTodos({
    status: activeStatusTab !== "all" ? activeStatusTab : selectedStatus !== "all" ? selectedStatus : undefined,
    priority: selectedPriority !== "all" ? selectedPriority : undefined,
  });

  useEffect(() => {
    if (searchParams.get("shortcut") === "add-todo") {
      setIsTodoSheetOpen(true);
    }
  }, [searchParams]);

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsTodoSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    removeTodo(id);
    setTodoToDelete(null);
  };

  const handleToggleComplete = (todo: Todo) => {
    const newStatus = todo.status === "completed" ? "pending" : "completed";
    editTodo({ id: todo._id, status: newStatus });
  };

  const completedCount = todos.filter((t) => t.status === "completed").length;
  const pendingCount = todos.filter((t) => t.status === "pending").length;
  const inProgressCount = todos.filter((t) => t.status === "in_progress").length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pb-28 max-w-full overflow-x-hidden">
        {/* Page Title */}
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-2xl font-bold text-center bg-clip-text" style={getTextGradientStyle(GRADIENTS.PRIMARY)}>
            Todos
          </h2>
        </div>

        {/* Stats Row */}
        <div className="px-4 pb-3 grid grid-cols-3 gap-3">
          <div className="rounded-[18px] p-3 text-center" style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)" }}>
            <p className="text-xs text-amber-600 font-medium">Pending</p>
            <p className="text-2xl font-bold" style={getTextGradientStyle(GRADIENTS.PRIMARY)}>{pendingCount}</p>
          </div>
          <div className="rounded-[18px] p-3 text-center" style={{ background: "linear-gradient(135deg, #e0e7ff 0%, #eff6ff 100%)" }}>
            <p className="text-xs text-blue-600 font-medium">In Progress</p>
            <p className="text-2xl font-bold" style={getTextGradientStyle(GRADIENTS.PRIMARY)}>{inProgressCount}</p>
          </div>
          <div className="rounded-[18px] p-3 text-center" style={{ background: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)" }}>
            <p className="text-xs text-green-600 font-medium">Completed</p>
            <p className="text-2xl font-bold" style={getTextGradientStyle(GRADIENTS.PRIMARY)}>{completedCount}</p>
          </div>
        </div>

        {/* Horizontal Status Tabs */}
        <div className="pl-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatusTab === tab.value;
            return (
              <button
                key={tab.value}
                id={`status-tab-${tab.value}`}
                onClick={() => { setActiveStatusTab(tab.value); setSelectedStatus(tab.value); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 border ${isActive ? "text-white border-transparent shadow-md" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
                style={isActive ? { background: GRADIENTS.PRIMARY } : {}}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Todo List */}
        <div className="space-y-3 px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" style={{ color: "#f59e42" }} />
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}>
                <CheckSquare className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-400 text-sm font-medium">No todos found</p>
              <p className="text-gray-300 text-xs">Tap the + button to add one!</p>
            </div>
          ) : (
            todos.map((todo) => (
              <TodoCard
                key={todo._id}
                todo={todo}
                onEdit={handleEdit}
                onDelete={(id) => setTodoToDelete(id)}
                onToggleComplete={handleToggleComplete}
              />
            ))
          )}
        </div>
      </div>

      {/* Floating Filter */}
      <div className="fixed bottom-24 right-6 z-50">
        <TodoFilters
          selectedStatus={selectedStatus}
          selectedPriority={selectedPriority}
          onStatusChange={(v) => { setSelectedStatus(v); setActiveStatusTab(v); }}
          onPriorityChange={setSelectedPriority}
          onFilter={() => {}}
        />
      </div>

      {/* FAB: Add / Edit Todo */}
      <TodoFormSheet
        onTodoAdded={() => { setIsTodoSheetOpen(false); setEditingTodo(null); }}
        isOpen={isTodoSheetOpen}
        onOpenChange={(open) => { setIsTodoSheetOpen(open); if (!open) setEditingTodo(null); }}
        editingTodo={editingTodo}
      />

      {/* Delete Confirmation */}
      <BottomSheet
        isOpen={!!todoToDelete}
        onOpenChange={() => setTodoToDelete(null)}
        title={<span className="text-xl font-bold text-red-600">🗑️ Delete Todo</span>}
        description={<>Confirm permanently delete this todo.<br />This action <strong>cannot</strong> be undone.</>}
      >
        <div className="pt-2">
          <SlideToConfirm variant="danger" label="Delete" onConfirm={() => todoToDelete && handleDelete(todoToDelete)} loading={isRemoving} />
        </div>
      </BottomSheet>
    </div>
  );
}
