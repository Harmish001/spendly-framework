import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SlideToConfirm } from "@/components/ui/SlideToConfirm";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus, IndianRupee } from "lucide-react";
import { GRADIENTS, getBackgroundGradientStyle } from "@/constants/theme";

const CSS = `
@keyframes drift {
  0%,100% { transform: translate(0,0) scale(1); }
  33%      { transform: translate(-18px,20px) scale(1.04); }
  66%      { transform: translate(14px,-16px) scale(0.97); }
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
  0%   { transform: scale(0.85); opacity: 0.5; }
  70%  { transform: scale(1.3);  opacity: 0; }
  100% { transform: scale(1.3);  opacity: 0; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(22px); }
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
  50%     { transform: translateY(-10px) rotate(-6deg); }
}
@keyframes strengthPop {
  0%   { transform: scaleX(0); }
  100% { transform: scaleX(1); }
}
.su-slide-up  { animation: slideUp 0.55s cubic-bezier(.22,1,.36,1) both; }
.su-fade-in   { animation: fadeIn 0.4s ease both; }
.su-d1  { animation-delay: 0.08s; }
.su-d2  { animation-delay: 0.16s; }
.su-d3  { animation-delay: 0.24s; }
.su-d4  { animation-delay: 0.32s; }
.su-d5  { animation-delay: 0.40s; }
.su-d6  { animation-delay: 0.48s; }
.su-d7  { animation-delay: 0.56s; }
.su-d8  { animation-delay: 0.64s; }
`;

function strengthInfo(pwd: string): {
  score: number;
  label: string;
  color: string;
} {
  const len = pwd.length;
  if (!len) return { score: 0, label: "", color: "transparent" };
  let s = 0;
  if (len >= 6) s++;
  if (len >= 10) s++;
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  const map = [
    { score: 1, label: "Weak", color: "#ef4444" },
    { score: 2, label: "Fair", color: "#f59e0b" },
    { score: 3, label: "Good", color: "#3b82f6" },
    { score: 4, label: "Strong", color: "#22c55e" },
  ];
  return { ...(map[s - 1] ?? map[0]), score: s };
}

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast.error(
          error.message.includes("already registered")
            ? "Email already registered."
            : error.message,
        );
        return;
      }
      toast.success("Account created! Check your email for confirmation.");
      navigate("/");
    } catch {
      toast.error("Unexpected error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const str = strengthInfo(password);
  const canSubmit = Boolean(email && password);

  return (
    <>
      <style>{CSS}</style>

      <div
        className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-8"
        style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
      >
        {/* blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            style={{
              position: "absolute",
              bottom: "-12%",
              right: "-18%",
              width: "58vw",
              height: "58vw",
              borderRadius: "55% 45% 40% 60% / 60% 40% 55% 45%",
              background:
                "radial-gradient(circle, rgba(255,200,100,0.07) 0%, transparent 70%)",
              animation: "drift 14s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-20%",
              right: "-8%",
              width: "52vw",
              height: "52vw",
              borderRadius: "45% 55% 60% 40% / 40% 60% 45% 55%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
              animation: "drift 10s ease-in-out infinite reverse",
            }}
          />
        </div>

        {/* floating symbols */}
        {[
          { top: "6%", right: "11%", dur: "4.5s", delay: "0.3s" },
          { top: "22%", left: "8%", dur: "5.5s", delay: "1s" },
          { bottom: "25%", left: "10%", dur: "6s", delay: "0s" },
          { bottom: "14%", right: "14%", dur: "5s", delay: "1.5s" },
        ].map((s, i) => (
          <IndianRupee
            key={i}
            className="absolute w-4 h-4 text-white/12 pointer-events-none"
            style={{
              ...s,
              animation: `float ${s.dur} ${s.delay} ease-in-out infinite`,
            }}
          />
        ))}

        <div className="relative z-10 w-full max-w-[360px]">
          {/* ── logo orbit ──────────────────────────────────── */}
          <div
            className={`flex justify-center mb-6 ${mounted ? "su-slide-up" : "opacity-0"}`}
          >
            <div className="relative" style={{ width: 84, height: 84 }}>
              <div
                className="absolute inset-0 rounded-full bg-white/15"
                style={{ animation: "pulseRing 2.6s ease-out infinite" }}
              />
              <div
                className="absolute inset-0 rounded-full bg-white/8"
                style={{ animation: "pulseRing 2.6s 1s ease-out infinite" }}
              />
              <div
                className="absolute inset-0 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)",
                  border: "1.5px solid rgba(255,255,255,0.28)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
                }}
              >
                <UserPlus className="w-9 h-9 text-white" />
              </div>
              {/* orbit dots */}
              {[
                {
                  anim: "orbit  7s linear infinite",
                  icon: "✦",
                  col: "rgba(255,210,100,0.9)",
                },
                {
                  anim: "orbit2 7s linear infinite",
                  icon: "₹",
                  col: "rgba(255,255,255,0.7)",
                },
                {
                  anim: "orbit3 7s linear infinite",
                  icon: "✦",
                  col: "rgba(100,240,160,0.75)",
                },
              ].map((d, i) => (
                <div
                  key={i}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ animation: d.anim }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.28)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 8,
                      color: d.col,
                      backdropFilter: "blur(4px)",
                      boxShadow: `0 0 6px ${d.col}`,
                    }}
                  >
                    {d.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* headline */}
          <div
            className={`text-center mb-5 ${mounted ? "su-slide-up su-d1" : "opacity-0"}`}
          >
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, #ffffff 0%, rgba(255,220,100,0.9) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Join Spendly
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Start your financial journey
            </p>
          </div>

          {/* ═══ GLASS CARD ═══════════════════════════════════ */}
          <div
            className={`relative rounded-[28px] overflow-hidden ${mounted ? "su-slide-up su-d3" : "opacity-0"}`}
            style={{
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.06) 100%)",
              border: "1.5px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(28px)",
              boxShadow:
                "0 32px 64px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <div
              style={{
                height: 2,
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
              }}
            />

            {/* corner dots */}
            <div className="absolute top-4 right-4 flex gap-1.5">
              {[
                "rgba(255,100,100,0.5)",
                "rgba(255,180,50,0.5)",
                "rgba(100,220,100,0.5)",
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: c,
                  }}
                />
              ))}
            </div>

            <div className="p-7 space-y-4">
              <div className={`${mounted ? "su-slide-up su-d4" : "opacity-0"}`}>
                <h2 className="text-lg font-semibold text-white">
                  Create account
                </h2>
                <p className="text-white/40 text-xs mt-0.5">
                  Free forever · no card needed
                </p>
              </div>

              {/* email */}
              <div className={`${mounted ? "su-slide-up su-d5" : "opacity-0"}`}>
                <div
                  className="relative overflow-hidden"
                  style={{
                    borderRadius: 16,
                    border: `1.5px solid ${emailFocus ? "rgba(255,220,130,0.55)" : "rgba(255,255,255,0.18)"}`,
                    background: emailFocus
                      ? "rgba(255,255,255,0.14)"
                      : "rgba(255,255,255,0.08)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {emailFocus && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        width: "60%",
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,220,130,0.15), transparent)",
                        pointerEvents: "none",
                        zIndex: 1,
                        animation: "scanLine 1.4s ease forwards",
                      }}
                    />
                  )}
                  <div className="flex items-center px-4 gap-3">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocus(true)}
                      onBlur={() => setEmailFocus(false)}
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "white",
                        fontSize: 14,
                        padding: "13px 0",
                        fontFamily: "inherit",
                      }}
                      className="placeholder-white/30"
                    />
                    {email && (
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "#4ade80",
                          boxShadow: "0 0 8px rgba(74,222,128,0.8)",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* password */}
              <div className={`${mounted ? "su-slide-up su-d6" : "opacity-0"}`}>
                <div
                  className="relative overflow-hidden"
                  style={{
                    borderRadius: 16,
                    border: `1.5px solid ${pwdFocus ? "rgba(255,220,130,0.55)" : "rgba(255,255,255,0.18)"}`,
                    background: pwdFocus
                      ? "rgba(255,255,255,0.14)"
                      : "rgba(255,255,255,0.08)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {pwdFocus && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        width: "60%",
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,220,130,0.15), transparent)",
                        pointerEvents: "none",
                        zIndex: 1,
                        animation: "scanLine 1.4s ease forwards",
                      }}
                    />
                  )}
                  <div className="flex items-center px-4 gap-3">
                    <input
                      type={showPwd ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPwdFocus(true)}
                      onBlur={() => setPwdFocus(false)}
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "white",
                        fontSize: 14,
                        padding: "13px 0",
                        fontFamily: "inherit",
                      }}
                      className="placeholder-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
                    >
                      {showPwd ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* strength bars */}
                {password && (
                  <div className="flex items-center gap-2 mt-2 px-1">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className="flex-1 h-1 rounded-full overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.12)" }}
                        >
                          {str.score >= n && (
                            <div
                              style={{
                                height: "100%",
                                background: str.color,
                                borderRadius: "inherit",
                                animation: "strengthPop 0.3s ease forwards",
                                transformOrigin: "left",
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: str.color, minWidth: 36 }}
                    >
                      {str.label}
                    </span>
                  </div>
                )}
              </div>

              {/* slide */}
              <div
                className={`pt-1 ${mounted ? "su-slide-up su-d7" : "opacity-0"}`}
              >
                <SlideToConfirm
                  label="Slide to Sign Up"
                  onConfirm={handleSignUp}
                  disabled={!canSubmit}
                  loading={loading}
                  isWhiteText
                  variant="confirm"
                />
              </div>

              {/* divider */}
              <div className="flex items-center gap-3">
                <div
                  className="flex-1 h-px"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                />
                <span className="text-white/30 text-xs">or</span>
                <div
                  className="flex-1 h-px"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                />
              </div>

              {/* sign in link */}
              <p
                className={`text-center text-white/50 text-sm pb-1 ${mounted ? "su-slide-up su-d8" : "opacity-0"}`}
              >
                Already a member?{" "}
                <button
                  onClick={() => navigate("/")}
                  className="font-semibold transition-colors"
                  style={{ color: "rgba(255,210,100,0.95)" }}
                >
                  Sign in
                </button>
              </p>
            </div>

            <div
              style={{
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
