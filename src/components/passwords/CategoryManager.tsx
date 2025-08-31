import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Edit, Trash2, Save, X, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#374151', '#1f2937'
];

export const CategoryManager = ({ open, onOpenChange, categories, onSuccess }: CategoryManagerProps) => {
  const [newCategory, setNewCategory] = useState({ name: "", color: "#6366f1" });
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('password_categories')
        .insert([{
          user_id: user.id,
          name: newCategory.name.trim(),
          color: newCategory.color,
          icon: 'Folder'
        }]);

      if (error) throw error;

      toast.success("Category created successfully!");
      resetForm();
      onSuccess();
    } catch (error) {
      console.error('Error creating category:', error);
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
        .from('password_categories')
        .update({
          name: editingCategory.name.trim(),
          color: editingCategory.color
        })
        .eq('id', editingCategory.id);

      if (error) throw error;

      toast.success("Category updated successfully!");
      resetForm();
      onSuccess();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error("Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? Passwords in this category will become uncategorized.")) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('password_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast.success("Category deleted successfully!");
      onSuccess();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Category */}
          <Card className="border-2 border-dashed border-muted-foreground/25 rounded-xl">
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Category
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Social Media"
                  className="rounded-lg"
                />
              </div>
              
              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-10 gap-2 mt-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                        newCategory.color === color ? 'border-gray-800 shadow-lg' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div 
                    className="w-6 h-6 rounded border" 
                    style={{ backgroundColor: newCategory.color }}
                  />
                  <span className="text-sm text-muted-foreground">Selected: {newCategory.color}</span>
                </div>
              </div>

              <Button 
                onClick={handleCreateCategory}
                disabled={loading || !newCategory.name.trim()}
                className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Category
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Existing Categories ({categories.length})</h3>
            
            {categories.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="p-8 text-center">
                  <Palette className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No categories created yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {categories.map((category) => (
                  <Card key={category.id} className="rounded-xl">
                    <CardContent className="p-4">
                      {editingCategory?.id === category.id ? (
                        <div className="space-y-3">
                          <Input
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory(prev => 
                              prev ? { ...prev, name: e.target.value } : null
                            )}
                            className="rounded-lg"
                          />
                          <div className="grid grid-cols-10 gap-1">
                            {colorPalette.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                                  editingCategory.color === color ? 'border-gray-800' : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setEditingCategory(prev => 
                                  prev ? { ...prev, color } : null
                                )}
                              />
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleUpdateCategory}
                              disabled={loading}
                              className="flex-1 rounded-lg"
                              size="sm"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditingCategory(null)}
                              variant="outline"
                              className="flex-1 rounded-lg"
                              size="sm"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium">{category.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {category.created_at && new Date(category.created_at).toLocaleDateString()}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setEditingCategory(category)}
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteCategory(category.id)}
                              variant="outline"
                              size="sm"
                              className="rounded-lg text-destructive hover:bg-destructive/10"
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
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

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)} variant="outline" className="rounded-lg">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
