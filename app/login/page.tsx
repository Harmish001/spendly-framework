"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { SlideToConfirm } from "@/components/ui/SlideToConfirm";
import { Eye, EyeOff, IndianRupee } from "lucide-react";
import { getBackgroundGradientStyle, GRADIENTS } from "@/lib/constants/theme";

/* ─── tiny inline styles ─────────────────────────────────────────────────── */
const CSS = `
@keyframes drift {
  0%,100% { transform: translate(0,0) scale(1); }
  33%      { transform: translate(18px,-22px) scale(1.05); }
  66%      { transform: translate(-14px,16px) scale(0.96); }
}
@keyframes orbit {
  from { transform: rotate(0deg)   translateX(44px) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(44px) rotate(-360deg); }
}
@keyframes orbit2 {
  from { transform: rotate(120deg)  translateX(44px) rotate(-120deg); }
  to   { transform: rotate(480deg)  translateX(44px) rotate(-480deg); }
}
@keyframes orbit3 {
  from { transform: rotate(240deg)  translateX(44px) rotate(-240deg); }
  to   { transform: rotate(600deg)  translateX(44px) rotate(-600deg); }
}
@keyframes pulseRing {
  0%   { transform: scale(0.85); opacity: 0.6; }
  70%  { transform: scale(1.25); opacity: 0; }
  100% { transform: scale(1.25); opacity: 0; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes scanLine {
  0%   { left: -100%; }
  100% { left: 130%; }
}
@keyframes float {
  0%,100% { transform: translateY(0px) rotate(0deg); }
  50%     { transform: translateY(-12px) rotate(8deg); }
}
.anim-slide-up  { animation: slideUp 0.55s cubic-bezier(.22,1,.36,1) both; }
.anim-fade-in   { animation: fadeIn 0.4s ease both; }
.delay-100 { animation-delay: 0.10s; }
.delay-200 { animation-delay: 0.20s; }
.delay-300 { animation-delay: 0.30s; }
.delay-400 { animation-delay: 0.40s; }
.delay-500 { animation-delay: 0.50s; }
.delay-600 { animation-delay: 0.60s; }
.delay-700 { animation-delay: 0.70s; }
`;

const ORBIT_DOTS = [
  { anim: "orbit  6s linear infinite", icon: "₹", color: "rgba(255,200,100,0.9)" },
  { anim: "orbit2 6s linear infinite", icon: "✦", color: "rgba(255,255,255,0.75)" },
  { anim: "orbit3 6s linear infinite", icon: "₹", color: "rgba(255,200,100,0.65)" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggingIn, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = "/dashboard";
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleSignIn = () => {
    if (!email || !password) return;
    login({ email, password });
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
      >
        <div
          style={{ animation: "pulseRing 1.6s ease-out infinite" }}
          className="w-16 h-16 rounded-full bg-white/25 flex items-center justify-center"
        >
          <IndianRupee className="w-7 h-7 text-white" />
        </div>
      </div>
    );
  }

  const canSubmit = Boolean(email && password);

  return (
    <>
      <style>{CSS}</style>
      <div
        className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-8"
        style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
      >
        {/* background mesh blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{ position: "absolute", top: "-10%", left: "-15%", width: "55vw", height: "55vw", borderRadius: "40% 60% 55% 45% / 45% 55% 60% 40%", background: "radial-gradient(circle, rgba(255,200,100,0.08) 0%, transparent 70%)", animation: "drift 12s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "-18%", right: "-10%", width: "60vw", height: "60vw", borderRadius: "60% 40% 45% 55% / 55% 45% 60% 40%", background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)", animation: "drift 16s ease-in-out infinite reverse" }} />
        </div>

        {/* floating rupees */}
        {[
          { top: "8%", left: "12%", size: "w-5 h-5", delay: "0s", dur: "5s" },
          { top: "18%", right: "9%", size: "w-4 h-4", delay: "1.2s", dur: "4.5s" },
          { bottom: "20%", left: "8%", size: "w-4 h-4", delay: "0.6s", dur: "6s" },
          { bottom: "30%", right: "12%", size: "w-3 h-3", delay: "2s", dur: "5.5s" },
        ].map((s, i) => (
          <IndianRupee key={i} className={`absolute ${s.size} text-white/15 pointer-events-none`} style={{ ...s, animation: `float ${s.dur} ${s.delay} ease-in-out infinite` }} />
        ))}

        <div className="relative z-10 w-full max-w-[360px]">
          {/* orbiting logo */}
          <div className={`flex justify-center mb-7 ${mounted ? "anim-slide-up" : "opacity-0"}`}>
            <div className="relative" style={{ width: 88, height: 88 }}>
              <div className="absolute inset-0 rounded-full bg-white/20" style={{ animation: "pulseRing 2.4s ease-out infinite" }} />
              <div className="absolute inset-0 rounded-full bg-white/10" style={{ animation: "pulseRing 2.4s 0.8s ease-out infinite" }} />
              <div className="absolute inset-0 rounded-full flex items-center justify-center shadow-2xl" style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 100%)", border: "1.5px solid rgba(255,255,255,0.28)", backdropFilter: "blur(12px)" }}>
                <IndianRupee className="w-9 h-9 text-white drop-shadow-lg" />
              </div>
              {ORBIT_DOTS.map((d, i) => (
                <div key={i} className="absolute inset-0 flex items-center justify-center" style={{ animation: d.anim }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: d.color, backdropFilter: "blur(4px)", boxShadow: `0 0 8px ${d.color}` }}>{d.icon}</div>
                </div>
              ))}
            </div>
          </div>

          {/* headline */}
          <div className={`text-center mb-5 ${mounted ? "anim-slide-up delay-100" : "opacity-0"}`}>
            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight" style={{ background: "linear-gradient(135deg, #ffffff 0%, rgba(255,220,130,0.9) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Spendly
            </h1>
          </div>

          {/* GLASS CARD */}
          <div className={`relative rounded-[28px] overflow-hidden ${mounted ? "anim-slide-up delay-300" : "opacity-0"}`} style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)", border: "1.5px solid rgba(255,255,255,0.2)", backdropFilter: "blur(28px)", boxShadow: "0 32px 64px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
            <div style={{ height: 2, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)" }} />
            <div className="absolute top-4 right-4 flex gap-1.5">
              {["rgba(255,100,100,0.5)", "rgba(255,180,50,0.5)", "rgba(100,220,100,0.5)"].map((c, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
              ))}
            </div>

            <div className="p-7 space-y-5">
              <div className={`${mounted ? "anim-slide-up delay-400" : "opacity-0"}`}>
                <h2 className="text-lg font-semibold text-white">Sign in</h2>
                <p className="text-white/45 text-xs mt-0.5">Welcome back &mdash; let&apos;s track your money</p>
              </div>

              {/* email input */}
              <div className={`${mounted ? "anim-slide-up delay-500" : "opacity-0"}`}>
                <div className="relative overflow-hidden" style={{ borderRadius: 16, border: `1.5px solid ${emailFocus ? "rgba(255,220,130,0.55)" : "rgba(255,255,255,0.18)"}`, background: emailFocus ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.09)", transition: "all 0.3s ease" }}>
                  {emailFocus && <div style={{ position: "absolute", top: 0, bottom: 0, width: "60%", background: "linear-gradient(90deg, transparent, rgba(255,220,130,0.15), transparent)", pointerEvents: "none", zIndex: 1, animation: "scanLine 1.4s ease forwards" }} />}
                  <div className="flex items-center px-4 gap-3">
                    <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setEmailFocus(true)} onBlur={() => setEmailFocus(false)} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "white", fontSize: 14, padding: "13px 0", fontFamily: "inherit" }} className="placeholder-white/30" />
                    {email && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px rgba(74,222,128,0.8)", flexShrink: 0 }} />}
                  </div>
                </div>
              </div>

              {/* password input */}
              <div className={`${mounted ? "anim-slide-up delay-600" : "opacity-0"}`}>
                <div className="relative overflow-hidden" style={{ borderRadius: 16, border: `1.5px solid ${pwdFocus ? "rgba(255,220,130,0.55)" : "rgba(255,255,255,0.18)"}`, background: pwdFocus ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.09)", transition: "all 0.3s ease" }}>
                  {pwdFocus && <div style={{ position: "absolute", top: 0, bottom: 0, width: "60%", background: "linear-gradient(90deg, transparent, rgba(255,220,130,0.15), transparent)", pointerEvents: "none", zIndex: 1, animation: "scanLine 1.4s ease forwards" }} />}
                  <div className="flex items-center px-4 gap-3">
                    <input type={showPwd ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setPwdFocus(true)} onBlur={() => setPwdFocus(false)} onKeyDown={(e) => e.key === "Enter" && handleSignIn()} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "white", fontSize: 14, padding: "13px 0", fontFamily: "inherit" }} className="placeholder-white/30" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className={`pt-1 ${mounted ? "anim-slide-up delay-700" : "opacity-0"}`}>
                <SlideToConfirm label="Confirm Sign In" onConfirm={handleSignIn} disabled={!canSubmit} loading={isLoggingIn} isWhiteText variant="confirm" />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                <span className="text-white/30 text-xs">or</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
              </div>

              <p className="text-center text-white/50 text-sm pb-1">
                New here?{" "}
                <button onClick={() => router.push("/signup")} className="font-semibold transition-colors" style={{ color: "rgba(255,210,100,0.95)" }}>
                  Create an account
                </button>
              </p>
            </div>

            <div style={{ height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)" }} />
          </div>
        </div>
      </div>
    </>
  );
}
