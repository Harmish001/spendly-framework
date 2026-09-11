import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Shuffle } from "lucide-react";
import { SlideToConfirm } from "@/components/ui/SlideToConfirm";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { toast } from "sonner";
import { usePasswords, Password } from "@/hooks/usePasswords";

interface Category {
  _id: string;
  name: string;
  color: string | null;
  icon: string | null;
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
  const [formData, setFormData] = useState<Partial<Password>>({
    title: "",
    username: "",
    email: "",
    passwordEncrypted: "",
    websiteUrl: "",
    notes: "",
    isFavorite: false,
    categoryId: null,
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
        passwordEncrypted: "",
        websiteUrl: "",
        notes: "",
        isFavorite: false,
        categoryId: null,
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

    setFormData((prev) => ({ ...prev, passwordEncrypted: shuffled }));
    toast.success("Secure password generated!");
  };

  const { addPasswordAsync, editPassword } = usePasswords();

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;
    if (!formData.title || !formData.passwordEncrypted) {
      toast.error("Title and password are required");
      return;
    }
    setLoading(true);

    try {
      if (password?._id) {
        await editPassword({ id: password._id, ...formData });
      } else {
        await addPasswordAsync(formData);
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
    <BottomSheet
      isOpen={open}
      onOpenChange={onOpenChange}
      title={password?._id ? "Edit Password" : "Add New Password"}
    >
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-sm font-semibold text-gray-700 ml-1">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="e.g., Gmail Account"
            className="rounded-[20px] h-12 border-gray-100 bg-gray-50/50"
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={formData.categoryId || "none"}
            onValueChange={(val) =>
              setFormData({ ...formData, categoryId: val === "none" ? null : val })
            }
          >
            <SelectTrigger className="rounded-[18px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="rounded-[18px]">
              <SelectItem value="none">None</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-sm font-semibold text-gray-700 ml-1">Username</Label>
          <Input
            id="username"
            value={formData.username || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, username: e.target.value }))
            }
            placeholder="Username"
            className="rounded-[20px] h-12 border-gray-100 bg-gray-50/50"
          />
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.passwordEncrypted}
                onChange={(e) =>
                  setFormData({ ...formData, passwordEncrypted: e.target.value })
                }
                className="pr-10 rounded-[18px]"
                required
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-9 w-9 p-0 rounded-full hover:bg-gray-100"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generatePassword}
                  className="h-9 w-9 p-0 rounded-full hover:bg-gray-100"
                  title="Generate password"
                >
                  <Shuffle className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Website URL</Label>
          <Input
            type="url"
            value={formData.websiteUrl || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, websiteUrl: e.target.value }))
            }
            placeholder="https://example.com"
            className="rounded-[20px] h-12 border-gray-100 bg-gray-50/50"
          />
        </div>

        <div className="flex items-center justify-between px-1">
          <Label htmlFor="favorite" className="text-sm font-semibold text-gray-700">
            Add to favorites
          </Label>
          <Switch
            id="favorite"
            checked={formData.isFavorite}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isFavorite: checked }))
            }
          />
        </div>

        <div className="pt-4">
          <SlideToConfirm
            label={password?._id ? "Update" : "Save Password"}
            onConfirm={handleSubmit}
            loading={loading}
            disabled={!formData.title || !formData.passwordEncrypted}
            variant="confirm"
          />
        </div>
        <button type="submit" className="hidden" />
      </form>
    </BottomSheet>
  );
};
