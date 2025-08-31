import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Star, 
  Copy, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2,
  Filter,
  Grid3X3,
  List,
  Heart,
  Shield,
  Lock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PasswordForm } from "@/components/passwords/PasswordForm";
import { CategoryManager } from "@/components/passwords/CategoryManager";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

interface Password {
  id: string;
  title: string;
  username: string | null;
  email: string | null;
  password_encrypted: string;
  website_url: string | null;
  notes: string | null;
  is_favorite: boolean;
  created_at: string;
  category_id: string | null;
  password_categories?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  } | null;
}

const PasswordManager = () => {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('password_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch passwords with categories
      const { data: passwordsData, error: passwordsError } = await supabase
        .from('passwords')
        .select(`
          *,
          password_categories (
            id,
            name,
            color,
            icon
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (passwordsError) throw passwordsError;
      setPasswords(passwordsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (passwordId: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(passwordId)) {
      newVisible.delete(passwordId);
    } else {
      newVisible.add(passwordId);
    }
    setVisiblePasswords(newVisible);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard!`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const toggleFavorite = async (passwordId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('passwords')
        .update({ is_favorite: !currentStatus })
        .eq('id', passwordId);

      if (error) throw error;
      
      setPasswords(prev => prev.map(p => 
        p.id === passwordId ? { ...p, is_favorite: !currentStatus } : p
      ));
      
      toast.success(!currentStatus ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      toast.error('Failed to update favorite status');
    }
  };

  const deletePassword = async (passwordId: string) => {
    if (!confirm('Are you sure you want to delete this password?')) return;

    try {
      const { error } = await supabase
        .from('passwords')
        .delete()
        .eq('id', passwordId);

      if (error) throw error;
      
      setPasswords(prev => prev.filter(p => p.id !== passwordId));
      toast.success('Password deleted successfully');
    } catch (error) {
      toast.error('Failed to delete password');
    }
  };

  const filteredPasswords = passwords.filter(password => {
    const matchesSearch = 
      password.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      password.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      password.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      password.website_url?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || password.category_id === selectedCategory;
    const matchesFavorites = !showFavorites || password.is_favorite;

    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const favoriteCount = passwords.filter(p => p.is_favorite).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Password Manager
            </h1>
          </div>
          <p className="text-muted-foreground">Secure storage for all your passwords</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => setShowPasswordForm(true)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl h-12"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Password
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowCategoryManager(true)}
            className="rounded-xl h-12 border-2"
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Manage Categories
          </Button>
        </div>

        {/* Search and Filter Section */}
        <Card className="border-0 shadow-lg rounded-2xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search passwords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl border-2 h-12"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1">
                  <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full rounded-xl bg-muted/50">
                    <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
                    <TabsTrigger value="favorites" onClick={() => setShowFavorites(!showFavorites)} className="rounded-lg">
                      <Heart className="h-4 w-4 mr-1" />
                      Favorites ({favoriteCount})
                    </TabsTrigger>
                    {categories.slice(0, 4).map(category => (
                      <TabsTrigger key={category.id} value={category.id} className="rounded-lg">
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-lg"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-lg"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passwords Grid/List */}
        {filteredPasswords.length === 0 ? (
          <Card className="border-0 shadow-lg rounded-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No passwords found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search criteria" : "Add your first password to get started"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowPasswordForm(true)} className="rounded-xl">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Password
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredPasswords.map((password) => (
              <Card key={password.id} className="border-0 shadow-lg rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{password.title}</h3>
                        {password.is_favorite && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      {password.password_categories && (
                        <Badge 
                          variant="secondary" 
                          className="rounded-lg"
                          style={{ 
                            backgroundColor: `${password.password_categories.color}20`,
                            color: password.password_categories.color 
                          }}
                        >
                          {password.password_categories.name}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(password.id, password.is_favorite)}
                      className="rounded-lg"
                    >
                      <Heart className={`h-4 w-4 ${password.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {password.username && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Username:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{password.username}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(password.username!, 'Username')}
                          className="h-6 w-6 p-0 rounded"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {password.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{password.email}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(password.email!, 'Email')}
                          className="h-6 w-6 p-0 rounded"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Password:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">
                        {visiblePasswords.has(password.id) 
                          ? password.password_encrypted 
                          : '••••••••'
                        }
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePasswordVisibility(password.id)}
                        className="h-6 w-6 p-0 rounded"
                      >
                        {visiblePasswords.has(password.id) ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(password.password_encrypted, 'Password')}
                        className="h-6 w-6 p-0 rounded"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {password.website_url && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Website:</span>
                      <div className="flex items-center gap-2">
                        <a 
                          href={password.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {password.website_url}
                        </a>
                      </div>
                    </div>
                  )}

                  {password.notes && (
                    <div className="pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Notes:</span>
                      <p className="text-sm mt-1">{password.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPassword(password);
                        setShowPasswordForm(true);
                      }}
                      className="flex-1 rounded-lg"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePassword(password.id)}
                      className="flex-1 rounded-lg text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Password Form Modal */}
      <PasswordForm
        open={showPasswordForm}
        onOpenChange={setShowPasswordForm}
        password={editingPassword}
        categories={categories}
        onSuccess={() => {
          fetchData();
          setShowPasswordForm(false);
          setEditingPassword(null);
        }}
      />

      {/* Category Manager Modal */}
      <CategoryManager
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
        categories={categories}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default PasswordManager;