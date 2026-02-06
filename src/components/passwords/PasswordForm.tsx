import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Shuffle, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { getBackgroundGradientStyle, GRADIENTS } from "@/constants/theme";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Password {
  id?: string;
  title: string;
  username: string | null;
  email: string | null;
  password_encrypted: string;
  website_url: string | null;
  notes: string | null;
  is_favorite: boolean;
  category_id: string | null;
}

interface PasswordFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  password?: Password | null;
  categories: Category[];
  onSuccess: () => void;
}

export const PasswordForm = ({
  open,
  onOpenChange,
  password,
  categories,
  onSuccess,
}: PasswordFormProps) => {
  const [formData, setFormData] = useState<Password>({
    title: "",
    username: "",
    email: "",
    password_encrypted: "",
    website_url: "",
    notes: "",
    is_favorite: false,
    category_id: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (password) {
      setFormData(password);
    } else {
      setFormData({
        title: "",
        username: "",
        email: "",
        password_encrypted: "",
        website_url: "",
        notes: "",
        is_favorite: false,
        category_id: null,
      });
    }
  }, [password, open]);

  const generatePassword = () => {
    const length = 16;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let password = "";

    // Ensure at least one character from each type
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    const shuffled = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setFormData((prev) => ({ ...prev, password_encrypted: shuffled }));
    toast.success("Secure password generated!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.password_encrypted) {
      toast.error("Title and password are required");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Exclude password_categories as it's a relationship, not a column
      const {
        password_categories,
        id,
        created_at,
        ...formDataWithoutRelations
      } = formData as any;

      const passwordData = {
        ...formDataWithoutRelations,
        user_id: user.id,
        username: formData.username || null,
        email: formData.email || null,
        website_url: formData.website_url || null,
        notes: formData.notes || null,
      };

      if (password?.id) {
        // Update existing password
        const { error } = await supabase
          .from("passwords")
          .update(passwordData)
          .eq("id", password.id);

        if (error) throw error;
        toast.success("Password updated successfully!");
      } else {
        // Create new password
        const { error } = await supabase
          .from("passwords")
          .insert([passwordData]);

        if (error) throw error;
        toast.success("Password saved successfully!");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving password:", error);
      toast.error("Failed to save password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="px-4">
        <DrawerHeader>
          <DrawerTitle className="text-xl font-semibold">
            {password?.id ? "Edit Password" : "Add New Password"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Gmail Account"
                className="rounded-[24px]"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    category_id: value || null,
                  }))
                }
              >
                <SelectTrigger className="rounded-[24px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                placeholder="Username"
                className="rounded-[24px]"
              />
            </div>

            {/* <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
                className="rounded-[24px]"
              />
            </div> */}

            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password_encrypted}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password_encrypted: e.target.value,
                    }))
                  }
                  placeholder="Password"
                  className="rounded-[24px] pr-20"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="h-8 w-8 p-0"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generatePassword}
                    className="h-8 w-8 p-0"
                    title="Generate password"
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                type="url"
                value={formData.website_url || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    website_url: e.target.value,
                  }))
                }
                placeholder="https://example.com"
                className="rounded-[24px]"
              />
            </div>

            {/* <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                className="rounded-[24px]"
                rows={3}
              />
            </div> */}

            <div className="flex items-center justify-between">
              <Label htmlFor="favorite" className="text-sm font-medium">
                Add to favorites
              </Label>
              <Switch
                id="favorite"
                checked={formData.is_favorite}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_favorite: checked }))
                }
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-full flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full"
                style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {password?.id ? "Update" : "Save"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
