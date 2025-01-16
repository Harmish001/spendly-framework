import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, LogOut, Wallet } from "lucide-react";

const categories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Others",
];

const Dashboard = () => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("expenses").insert({
        amount: parseFloat(amount),
        description,
        category,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Expense added successfully",
      });

      // Reset form
      setAmount("");
      setDescription("");
      setCategory("");
      
      // Refresh expenses
      fetchExpenses();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    } else {
      navigate("/");
    }
  };

  // Fetch expenses on component mount
  useState(() => {
    fetchExpenses();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-purple-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Wallet className="h-8 w-8" />
            Spendly
          </h1>
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid md:grid-cols-[350px,1fr] gap-6">
          {/* Add Expense Form */}
          <Card className="bg-white/10 border-white/20 text-white h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Add Expense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                  />
                </div>
                <div>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Expense"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Expenses List */}
          <div className="space-y-4">
            {expenses.map((expense) => (
              <Card
                key={expense.id}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors"
              >
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-semibold">{expense.description || "No description"}</p>
                    <p className="text-sm text-white/70">{expense.category}</p>
                    <p className="text-xs text-white/50">
                      {new Date(expense.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xl font-bold">${expense.amount}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;