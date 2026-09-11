"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";

export interface Expense {
  _id: string;
  userId: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface ExpensesFilter {
  month?: string;
  year?: string;
  category?: string;
}

// ─── API Helpers ──────────────────────────────────────────────────────────────

async function fetchExpenses(filter: ExpensesFilter): Promise<Expense[]> {
  const params = new URLSearchParams();
  if (filter.month) params.set("month", filter.month);
  if (filter.year) params.set("year", filter.year);
  if (filter.category && filter.category !== "All Categories")
    params.set("category", filter.category);

  const res = await fetch(`/api/expenses?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch expenses");
  const data = await res.json();
  return data.expenses;
}

async function deleteExpense(id: string): Promise<void> {
  const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to delete expense");
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useExpenses(filter: ExpensesFilter = {}) {
  const queryClient = useQueryClient();
  const queryKey = ["expenses", filter];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchExpenses(filter),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteExpense(id);
      return id;
    },
    onSuccess: (deletedId) => {
      toast.success("Expense deleted successfully!");
      queryClient.setQueriesData(
        { queryKey: ["expenses"] },
        (old: Expense[] | undefined) => {
          if (!old) return old;
          return old.filter((e) => e._id !== deletedId);
        }
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const totalExpense = (query.data ?? []).reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  return {
    expenses: query.data ?? [],
    totalExpense,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    removeExpense: deleteMutation.mutate,
    isRemoving: deleteMutation.isPending,
  };
}
