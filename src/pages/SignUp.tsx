import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Check your email for the confirmation link!");
      navigate("/");
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-[24px] shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
            <Wallet className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded p-1" />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Spendly
            </span>
          </h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        <form className="space-y-6" onSubmit={handleSignUp}>
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-[16px]"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-[16px]"
            />
          </div>
          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-[16px]"
              style={{
                background: "linear-gradient(to right, #9333ea, #2563eb)",
              }}
            >
              Sign Up
            </Button>
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;