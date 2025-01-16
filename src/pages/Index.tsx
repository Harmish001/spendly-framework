import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wallet } from "lucide-react";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (error: any) {
      let errorMessage = error.message;
      
      if (error.message.includes("email_address_invalid")) {
        errorMessage = "Please enter a valid email address";
      } else if (error.message.includes("password")) {
        errorMessage = "Password must be at least 6 characters long";
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-purple-900">
      <div className="w-full max-w-md p-8 mx-4 backdrop-blur-lg bg-white/10 rounded-2xl shadow-xl border border-white/20">
        <div className="flex justify-center mb-8">
          <Wallet className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-center mb-2 text-white">
          Spendly
        </h1>
        <p className="text-center text-white/70 mb-8">
          Track your expenses with style
        </p>
        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/50"
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/50"
              required
              minLength={6}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold py-2 rounded-lg transition-all duration-200"
            disabled={loading}
          >
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-white/80 hover:text-white transition-colors"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;