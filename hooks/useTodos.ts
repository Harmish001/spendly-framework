"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Todo {
  _id: string;
  userId: string;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TodosFilter {
  status?: string;
  priority?: string;
}

async function fetchTodos(filter: TodosFilter): Promise<Todo[]> {
  const params = new URLSearchParams();
  if (filter.status && filter.status !== "all") params.set("status", filter.status);
  if (filter.priority && filter.priority !== "all") params.set("priority", filter.priority);
  const res = await fetch(`/api/todos?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch todos");
  return (await res.json()).todos;
}

async function createTodo(payload: Partial<Todo>): Promise<Todo> {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create todo");
  return data.todo;
}

async function updateTodo({ id, ...payload }: Partial<Todo> & { id: string }): Promise<Todo> {
  const res = await fetch(`/api/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update todo");
  return data.todo;
}

async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete todo");
}

export function useTodos(filter: TodosFilter = {}) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["todos"] });

  const query = useQuery({
    queryKey: ["todos", filter],
    queryFn: () => fetchTodos(filter),
  });

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => { toast.success("Todo added!"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateTodo,
    onSuccess: () => { toast.success("Todo updated!"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => { toast.success("Todo deleted!"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    todos: query.data ?? [],
    isLoading: query.isLoading,
    addTodo: createMutation.mutate,
    addTodoAsync: createMutation.mutateAsync,
    isAdding: createMutation.isPending,
    editTodo: updateMutation.mutate,
    isEditing: updateMutation.isPending,
    removeTodo: deleteMutation.mutate,
    isRemoving: deleteMutation.isPending,
  };
}
