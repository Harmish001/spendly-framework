"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface PasswordCategory {
  _id: string;
  name: string;
  color: string | null;
  icon: string | null;
}

export interface Password {
  _id: string;
  title: string;
  username: string | null;
  email: string | null;
  passwordEncrypted: string;
  websiteUrl: string | null;
  notes: string | null;
  isFavorite: boolean;
  categoryId: string | null;
  password_categories?: PasswordCategory | null; // populated
  createdAt: string;
  updatedAt: string;
}

interface PasswordsFilter {
  categoryId?: string;
  favoritesOnly?: boolean;
}

// ─── Categories ───────────────────────────────────────────────────────────────

async function fetchCategories(): Promise<PasswordCategory[]> {
  const res = await fetch("/api/password-categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return (await res.json()).categories;
}

async function createCategory(payload: Partial<PasswordCategory>): Promise<PasswordCategory> {
  const res = await fetch("/api/password-categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create category");
  return data.category;
}

async function updateCategory({ id, ...payload }: Partial<PasswordCategory> & { id: string }) {
  const res = await fetch(`/api/password-categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update category");
  return data.category;
}

async function deleteCategory(id: string) {
  const res = await fetch(`/api/password-categories/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete category");
}

// ─── Passwords ────────────────────────────────────────────────────────────────

async function fetchPasswords(filter: PasswordsFilter): Promise<Password[]> {
  const params = new URLSearchParams();
  if (filter.categoryId) params.set("categoryId", filter.categoryId);
  if (filter.favoritesOnly) params.set("favorites", "true");
  const res = await fetch(`/api/passwords?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch passwords");
  return (await res.json()).passwords;
}

async function createPassword(payload: Partial<Password>): Promise<Password> {
  const res = await fetch("/api/passwords", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save password");
  return data.password;
}

async function updatePassword({ id, ...payload }: Partial<Password> & { id: string }) {
  const res = await fetch(`/api/passwords/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update password");
  return data.password;
}

async function deletePassword(id: string) {
  const res = await fetch(`/api/passwords/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete password");
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function usePasswordCategories() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["password-categories"] });

  const query = useQuery({ queryKey: ["password-categories"], queryFn: fetchCategories });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => { toast.success("Category created!"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => { toast.success("Category updated!"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => { toast.success("Category deleted!"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    addCategory: createMutation.mutate,
    editCategory: updateMutation.mutate,
    removeCategory: deleteMutation.mutate,
  };
}

export function usePasswords(filter: PasswordsFilter = {}) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["passwords"] });
  };

  const query = useQuery({
    queryKey: ["passwords", filter],
    queryFn: () => fetchPasswords(filter),
  });

  const createMutation = useMutation({
    mutationFn: createPassword,
    onSuccess: () => { toast.success("Password saved!"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => { toast.success("Password updated!"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePassword,
    onSuccess: () => { toast.success("Password deleted!"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    passwords: query.data ?? [],
    isLoading: query.isLoading,
    addPassword: createMutation.mutate,
    addPasswordAsync: createMutation.mutateAsync,
    isAdding: createMutation.isPending,
    editPassword: updateMutation.mutate,
    isEditing: updateMutation.isPending,
    removePassword: deleteMutation.mutate,
    isRemoving: deleteMutation.isPending,
  };
}
