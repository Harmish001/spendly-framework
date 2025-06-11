import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ArrowRight,
  Eye,
  EyeOff,
  IndianRupee,
  Sparkles,
  Wallet,
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error checking session:", error);
    } finally {
      setCheckingSession(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      navigate("/dashboard");
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    // <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
    //   <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-[24px] shadow-xl">
    //     <div className="text-center">
    //       <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
    //         <Wallet className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded p-1" />
    //         <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
    //           Spendly
    //         </span>
    //       </h1>
    //       <p className="text-gray-600">Track your expenses with ease</p>
    //     </div>

    //     <form className="space-y-6" onSubmit={handleSignIn}>
    //       <div>
    //         <Input
    //           type="email"
    //           placeholder="Email"
    //           value={email}
    //           onChange={(e) => setEmail(e.target.value)}
    //           required
    //           className="rounded-[16px]"
    //         />
    //       </div>
    //       <div>
    //         <Input
    //           type="password"
    //           placeholder="Password"
    //           value={password}
    //           onChange={(e) => setPassword(e.target.value)}
    //           required
    //           className="rounded-[16px]"
    //         />
    //       </div>
    //       <div className="flex flex-col gap-4">
    //         <Button
    //           type="submit"
    //           disabled={loading}
    //           className="w-full rounded-[16px]"
    //           style={{
    //             background: "linear-gradient(to right, #9333ea, #2563eb)",
    //           }}
    //         >
    //           Sign In
    //         </Button>
    //         <p className="text-center text-sm text-gray-600">
    //           No account?{" "}
    //           <Link
    //             to="/signup"
    //             className="text-blue-600 hover:text-blue-800 font-medium"
    //           >
    //             Click here to sign up
    //           </Link>
    //         </p>
    //       </div>
    //     </form>
    //   </div>
    // </div>
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/5 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-white/10 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white/10 rounded-full animate-ping delay-700"></div>
        <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-white/5 rounded-full animate-pulse delay-300"></div>
      </div>

      {/* Floating Rupee Symbols */}
      <div className="absolute inset-0 pointer-events-none">
        <IndianRupee className="absolute top-16 left-1/4 w-6 h-6 text-white/20 animate-bounce delay-200" />
        <IndianRupee className="absolute top-1/3 right-1/4 w-4 h-4 text-white/15 animate-pulse delay-1000" />
        <IndianRupee className="absolute bottom-1/4 left-1/3 w-5 h-5 text-white/10 animate-bounce delay-700" />
        <Sparkles className="absolute top-1/4 right-1/2 w-4 h-4 text-white/20 animate-ping delay-500" />
        <Sparkles className="absolute bottom-1/3 right-1/4 w-3 h-3 text-white/15 animate-pulse delay-300" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Brand */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6 shadow-2xl">
              <IndianRupee className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome to Spendly
            </h1>
            <p className="text-white/80 text-lg">
              Your smart expense companion
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Sign In
                </h2>
                <p className="text-white/70">
                  Enter your credentials to continue
                </p>
              </div>

              <div className="space-y-6">
                {/* Username Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
                  </div>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 pr-4 py-6 bg-white/10 border-white/20 rounded-2xl text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 transition-all duration-300 text-lg"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        email ? "bg-green-400" : "bg-white/30"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 py-6 bg-white/10 border-white/20 rounded-2xl text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 transition-all duration-300 text-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                className="w-full py-6 bg-white text-purple-600 hover:bg-white/90 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                disabled={!email || !password}
                onClick={handleSignIn}
              >
                Sign In to Spendly
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* Additional Options */}
              <div className="text-center space-y-4">
                <button className="text-white/80 hover:text-white transition-colors text-sm underline underline-offset-4">
                  Forgot your password?
                </button>

                <div className="flex items-center justify-center space-x-2 text-white/70 text-sm">
                  <span>Don't have an account?</span>
                  <button
                    className="text-white hover:text-white/80 transition-colors font-medium underline underline-offset-4"
                    onClick={() => navigate("/signup")}
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Text */}
          <div className="text-center mt-8">
            <p className="text-white/60 text-sm">
              Secure login powered by advanced encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
