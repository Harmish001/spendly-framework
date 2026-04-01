import { useState, useCallback } from "react";
import { CheckCircle2, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { GRADIENTS } from "@/constants/theme";
import { cn } from "@/lib/utils";

type SlideVariant = "confirm" | "danger";

interface SlideToConfirmProps {
  label?: string;
  onConfirm: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: SlideVariant;
  isWhiteText?: boolean;
}

const VARIANT_CONFIG: Record<
  SlideVariant,
  {
    gradient: string;
    shadowColor: string;
    icon: any;
    successIcon: any;
  }
> = {
  confirm: {
    gradient: GRADIENTS.PRIMARY,
    shadowColor: "rgba(123, 63, 30, 0.45)",
    icon: ChevronRight,
    successIcon: CheckCircle2,
  },
  danger: {
    gradient: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
    shadowColor: "rgba(220, 38, 38, 0.35)",
    icon: Trash2,
    successIcon: Trash2,
  },
};

export const SlideToConfirm = ({
  label = "Confirm",
  onConfirm,
  disabled = false,
  loading = false,
  variant = "confirm",
  isWhiteText = false, // Kept for compatibility but ignored for solid design
}: SlideToConfirmProps) => {
  const config = VARIANT_CONFIG[variant];
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = useCallback(() => {
    if (disabled || loading || isSuccess) return;

    setIsSuccess(true);
    setTimeout(() => {
      onConfirm();
      setTimeout(() => setIsSuccess(false), 2000);
    }, 600);
  }, [disabled, loading, isSuccess, onConfirm]);

  const Icon = config.icon;
  const SuccessIcon = config.successIcon;

  return (
    <button
      onClick={handleClick}
      onMouseDown={() => !disabled && !loading && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => !disabled && !loading && setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      disabled={disabled || loading}
      className={cn(
        "relative w-full h-[58px] rounded-full overflow-hidden transition-all duration-300",
        "flex items-center justify-center gap-3 px-8",
        "group select-none outline-none focus:ring-4 focus:ring-[#7B3F1E]/20",
        disabled || loading
          ? "cursor-not-allowed opacity-70 grayscale-[0.5]"
          : "cursor-pointer",
        isPressed && !isSuccess
          ? "scale-[0.96] brightness-90"
          : "active:scale-[0.98]",
      )}
      style={{
        background: config.gradient,
        boxShadow:
          isPressed && !isSuccess
            ? `0 4px 10px -2px ${config.shadowColor}`
            : `0 12px 24px -8px ${config.shadowColor}`,
        borderTop: "1px solid rgba(255, 255, 255, 0.25)",
        borderLeft: "1px solid rgba(255, 255, 255, 0.12)",
        borderRight: "1px solid rgba(255, 255, 255, 0.12)",
      }}
    >
      {/* Automatic High-Intensity Sheen Effect (Mobile Friendly) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.22) 50%, transparent 80%)",
          backgroundSize: "200% 100%",
          animation: "sheen 3s infinite linear",
        }}
      />

      {/* Radiant Pulse Layer (Success) */}
      {isSuccess && (
        <div className="absolute inset-0 animate-ping opacity-40 bg-white/20 rounded-full" />
      )}

      {/* Content Layer */}
      <div className="relative z-10 flex items-center justify-center gap-3">
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        ) : isSuccess ? (
          <SuccessIcon className="h-6 w-6 text-white animate-in zoom-in duration-300" />
        ) : (
          <Icon className="h-6 w-6 text-white transition-transform duration-300 group-hover:translate-x-1" />
        )}

        <span className="text-lg font-bold tracking-tight text-white drop-shadow-sm">
          {loading ? "Processing..." : isSuccess ? "Success!" : label}
        </span>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes sheen {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `,
        }}
      />
    </button>
  );
};
