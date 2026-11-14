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

function sortExpenses(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => {
    const dateComp = (b.date || "").localeCompare(a.date || "");
    if (dateComp !== 0) return dateComp;
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });
}

function expenseMatchesFilter(
  expense: Expense,
  filter?: { month?: string; year?: string; category?: string }
): boolean {
  if (!filter) return true;
  const dateStr = (expense.date || "").split("T")[0];
  const [year, month] = dateStr.split("-");

  if (filter.month && filter.month.padStart(2, "0") !== month) {
    return false;
  }
  if (filter.year && filter.year !== year) {
    return false;
  }
  if (
    filter.category &&
    filter.category !== "All Categories" &&
    filter.category !== expense.category
  ) {
    return false;
  }
  return true;
}

// ─── Hook (mutations only — no query, no fetch) ───────────────────────────────

export function useExpenseMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: (newExpense) => {
      toast.success("Expense added successfully!");

      const queries = queryClient.getQueryCache().findAll({ queryKey: ["expenses"] });
      queries.forEach((q) => {
        const filter = q.queryKey[1] as
          | { month?: string; year?: string; category?: string }
          | undefined;

        queryClient.setQueryData(q.queryKey, (old: Expense[] | undefined) => {
          if (!old) return old;
          // Only add to the query cache if the new expense matches this query's month/year/category
          if (!expenseMatchesFilter(newExpense, filter)) {
            return old;
          }

          return sortExpenses([
            newExpense,
            ...old.filter((e) => e._id !== newExpense._id),
          ]);
        });
      });

      // Invalidate queries so active views get fresh data from server
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateExpense,
    onSuccess: (updatedExpense) => {
      toast.success("Expense updated successfully!");

      const queries = queryClient.getQueryCache().findAll({ queryKey: ["expenses"] });
      queries.forEach((q) => {
        const filter = q.queryKey[1] as
          | { month?: string; year?: string; category?: string }
          | undefined;

        queryClient.setQueryData(q.queryKey, (old: Expense[] | undefined) => {
          if (!old) return old;
          const matches = expenseMatchesFilter(updatedExpense, filter);

          let next: Expense[];
          if (matches) {
            const exists = old.some((e) => e._id === updatedExpense._id);
            next = exists
              ? old.map((e) => (e._id === updatedExpense._id ? updatedExpense : e))
              : [...old, updatedExpense];
          } else {
            // Expense no longer belongs in this filtered view (e.g. moved month or category)
            next = old.filter((e) => e._id !== updatedExpense._id);
          }

          return sortExpenses(next);
        });
      });

      // Invalidate queries so active views get fresh data from server
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    addExpense: createMutation.mutate,
    addExpenseAsync: createMutation.mutateAsync,
    isAdding: createMutation.isPending,
    editExpense: updateMutation.mutate,
    editExpenseAsync: updateMutation.mutateAsync,
    isEditing: updateMutation.isPending,
  };
}
