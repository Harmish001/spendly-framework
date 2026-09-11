"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Expense } from "./useExpenses";

// ─── API Helpers ──────────────────────────────────────────────────────────────

async function createExpense(
  payload: Omit<Expense, "_id" | "userId" | "createdAt" | "updatedAt">
): Promise<Expense> {
  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create expense");
  return data.expense;
}

async function updateExpense({
  id,
  ...payload
}: Partial<Expense> & { id: string }): Promise<Expense> {
  const res = await fetch(`/api/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update expense");
  return data.expense;
}

// ─── Hook (mutations only — no query, no fetch) ───────────────────────────────

export function useExpenseMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: (newExpense) => {
      toast.success("Expense added successfully!");
      queryClient.setQueriesData(
        { queryKey: ["expenses"] },
        (old: Expense[] | undefined) => {
          if (!old) return old;
          return [newExpense, ...old];
        }
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateExpense,
    onSuccess: (updatedExpense) => {
      toast.success("Expense updated successfully!");
      queryClient.setQueriesData(
        { queryKey: ["expenses"] },
        (old: Expense[] | undefined) => {
          if (!old) return old;
          return old.map((e) =>
            e._id === updatedExpense._id ? updatedExpense : e
          );
        }
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    addExpense: createMutation.mutate,
    addExpenseAsync: createMutation.mutateAsync,
    isAdding: createMutation.isPending,
    editExpense: updateMutation.mutate,
    isEditing: updateMutation.isPending,
  };
}
