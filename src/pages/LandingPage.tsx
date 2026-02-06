import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Calendar,
  Smartphone,
  ArrowRight,
  IndianRupee,
  Camera,
  Mic,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GRADIENTS,
  getTextGradientStyle,
  getBackgroundGradientStyle,
} from "@/constants/theme";

export default function LandingPage() {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);

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

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
            >
              <IndianRupee className="w-5 h-5 text-white" />
            </div>
            <span
              className="text-xl font-bold"
              style={getTextGradientStyle(GRADIENTS.PRIMARY)}
            >
              Spendly
            </span>
          </div>
          <Button
            className="rounded-full text-white px-6"
            style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
            onClick={handleLogin}
          >
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-sm font-medium text-orange-700 mb-4">
            <TrendingUp className="w-4 h-4 mr-2" />
            Smart Expense Management
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
            Take Control of Your
            <span
              className="block"
              style={getTextGradientStyle(GRADIENTS.PRIMARY)}
            >
              Expenses
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Track, analyze, and optimize your spending with intelligent
            insights. Add expenses by voice, scan receipts with your camera, and
            get weekly and monthly reports.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button
              size="lg"
              className="rounded-full text-white px-8 py-3 text-lg w-full sm:w-auto"
              style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
              onClick={handleSignup}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* App Screenshots Section - Space for your 3 images */}
        <div className="mt-12 md:mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">
              See Spendly in Action
            </h3>
            <p className="text-slate-600">
              Experience the power of smart expense management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Placeholder for your first image */}
            <img src="images/ss-1.jpg" alt="" />

            {/* Placeholder for your second image */}
            <img src="images/ss-2.jpg" alt="" />

            {/* Placeholder for your third image */}
            <img src="images/ss-3.jpg" alt="" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything You Need to Manage Expenses
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Powerful features designed to give you complete control over your
            financial life
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <Card className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
              >
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Scan Receipt Images
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Simply take a photo of your receipt and let our AI extract all
                the expense details automatically. No more manual entry!
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
              >
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Voice Expense Entry
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Add expenses hands-free with voice commands. Just speak your
                expense details and we'll handle the rest.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
              >
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Smart Analytics
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Get detailed insights into your spending patterns with
                interactive charts and graphs that make your data easy to
                understand.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
              >
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Weekly & Monthly Reports
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Receive comprehensive reports that break down your expenses by
                week and month, helping you spot trends and opportunities.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
              >
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Category Breakdown
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Automatically categorize your expenses and see exactly where
                your money goes with beautiful visual breakdowns.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
              >
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Mobile First
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Designed for mobile users. Track expenses on the go with our
                intuitive mobile interface that works seamlessly on any device.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section
        className="py-16 md:py-24"
        style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-purple-100 text-lg max-w-2xl mx-auto">
              Join the growing community of users who have taken control of
              their finances
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                10K+
              </div>
              <div className="text-purple-100">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                ₹2Cr+
              </div>
              <div className="text-purple-100">Expenses Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                95%
              </div>
              <div className="text-purple-100">User Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                24/7
              </div>
              <div className="text-purple-100">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Ready to Take Control of Your Expenses?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Start your journey to better financial management today. It's free
            to get started and takes less than 2 minutes to set up.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="rounded-full text-white px-8 py-3 text-lg w-full sm:w-auto"
              style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
              onClick={handleSignup}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-2 border-orange-200 hover:bg-orange-50 px-8 py-3 text-lg w-full sm:w-auto"
              onClick={handleLogin}
            >
              Login to Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
              >
                <IndianRupee className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Spendly</span>
            </div>

            <div className="flex space-x-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
            <p>
              &copy; {new Date().getFullYear()} Spendly. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
