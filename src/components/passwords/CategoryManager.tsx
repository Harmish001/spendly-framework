import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Edit, Trash2, Save, X, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getBackgroundGradientStyle, GRADIENTS } from "@/constants/theme";
import { SlideToConfirm } from "@/components/ui/SlideToConfirm";
import { BottomSheet } from "@/components/ui/BottomSheet";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

interface CategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onSuccess: () => void;
}

const colorPalette = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#64748b",
  "#374151",
  "#1f2937",
];

export const CategoryManager = ({
  open,
  onOpenChange,
  categories,
  onSuccess,
}: CategoryManagerProps) => {
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#6366f1",
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setNewCategory({ name: "", color: "#6366f1" });
    setEditingCategory(null);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("password_categories").insert([
        {
          user_id: user.id,
          name: newCategory.name.trim(),
          color: newCategory.color,
          icon: "Folder",
        },
      ]);

      if (error) throw error;

      toast.success("Category created successfully!");
      resetForm();
      onSuccess();
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("password_categories")
        .update({
          name: editingCategory.name.trim(),
          color: editingCategory.color,
        })
        .eq("id", editingCategory.id);

      if (error) throw error;

      toast.success("Category updated successfully!");
      resetForm();
      onSuccess();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? Passwords in this category will become uncategorized.",
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("password_categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      toast.success("Category deleted successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      isOpen={open}
      onOpenChange={onOpenChange}
      title="Manage Categories"
    >
      <div className="space-y-6">
        {/* Create New Category */}
        <Card className="p-4 rounded-2xl border-gray-100 bg-gray-50/30">
          <CardContent className="space-y-4 p-0">
            <div className="space-y-2">
              <Label htmlFor="categoryName" className="text-sm font-semibold text-gray-700 ml-1">Category Name</Label>
              <Input
                id="categoryName"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="e.g., Social Media"
                className="rounded-[20px] h-12 border-gray-100 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 ml-1">Color Palette</Label>
              <div className="grid grid-cols-7 gap-2 mt-1">
                {colorPalette.slice(0, 14).map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 active:scale-95 ${
                      newCategory.color === color
                        ? "border-gray-800 shadow-md ring-2 ring-gray-100"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() =>
                      setNewCategory((prev) => ({ ...prev, color }))
                    }
                  />
                ))}
              </div>
            </div>

            <div className="pt-2">
              <SlideToConfirm
                label="Create Category"
                onConfirm={handleCreateCategory}
                loading={loading}
                disabled={!newCategory.name.trim()}
                variant="confirm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Existing Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold tracking-tight">
              Existing Categories
            </h3>
            <Badge variant="secondary" className="rounded-full bg-gray-100 text-gray-600 border-none px-3">
              {categories.length}
            </Badge>
          </div>

          {categories.length === 0 ? (
            <Card className="rounded-2xl border-dashed border-2 border-gray-100">
              <CardContent className="p-10 text-center">
                <Palette className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-400 font-medium">
                  No categories created yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 overflow-y-auto pr-1">
              {categories.map((category) => (
                <Card key={category.id} className="rounded-2xl border-gray-100 overflow-hidden">
                  <CardContent className="p-4">
                    {editingCategory?.id === category.id ? (
                      <div className="space-y-4">
                        <Input
                          value={editingCategory.name}
                          onChange={(e) =>
                            setEditingCategory((prev) =>
                              prev ? { ...prev, name: e.target.value } : null,
                            )
                          }
                          className="rounded-[16px] h-10"
                        />
                        <div className="grid grid-cols-10 gap-1.5">
                          {colorPalette.slice(0, 20).map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`w-6 h-6 rounded-full border transition-all hover:scale-110 ${
                                editingCategory.color === color
                                  ? "border-gray-800 ring-1 ring-gray-200"
                                  : "border-transparent"
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() =>
                                setEditingCategory((prev) =>
                                  prev ? { ...prev, color } : null,
                                )
                              }
                            />
                          ))}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button
                            onClick={handleUpdateCategory}
                            disabled={loading}
                            className="flex-1 rounded-[14px]"
                            size="sm"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingCategory(null)}
                            variant="outline"
                            className="flex-1 rounded-[14px]"
                            size="sm"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-full shadow-sm"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-semibold text-gray-800">{category.name}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <Button
                            onClick={() => setEditingCategory(category)}
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-9 w-9 hover:bg-gray-100"
                          >
                            <Edit className="h-4.5 w-4.5 text-gray-500" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteCategory(category.id)}
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-9 w-9 hover:bg-red-50 text-red-500 hover:text-red-600"
                            disabled={loading}
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
