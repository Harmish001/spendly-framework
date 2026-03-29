import { useRef, useState, useCallback } from "react";
import { CheckCircle2, ChevronRight, Trash2 } from "lucide-react";
import { GRADIENTS } from "@/constants/theme";

type SlideVariant = "confirm" | "danger";

interface SlideToConfirmProps {
  label?: string;
  onConfirm: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: SlideVariant;
}

const THUMB_SIZE = 52; // px
const CONFIRM_THRESHOLD = 0.82; // 82% of track
const SPRING_DURATION = 350; // ms

// ── Variant colour maps ───────────────────────────────────────────────────────
const VARIANT_STYLES: Record<
  SlideVariant,
  {
    trackBg: string;
    trackBorder: string;
    fillGradient: string;
    labelGradient: string;
    chevronColor: string;
    thumbGradient: string;
    thumbShadowDrag: string;
    thumbShadowIdle: string;
    successGradient: string;
  }
> = {
  confirm: {
    trackBg:
      "linear-gradient(135deg, rgba(46,32,16,0.12) 0%, rgba(123,63,30,0.12) 100%)",
    trackBorder: "rgba(123,63,30,0.3)",
    fillGradient: GRADIENTS.PRIMARY,
    labelGradient: GRADIENTS.PRIMARY,
    chevronColor: "#7B3F1E",
    thumbGradient: GRADIENTS.PRIMARY,
    thumbShadowDrag: "0 6px 20px rgba(123,63,30,0.45)",
    thumbShadowIdle: "0 3px 10px rgba(123,63,30,0.3)",
    successGradient: "linear-gradient(135deg, #16a34a 0%, #4ade80 100%)",
  },
  danger: {
    trackBg:
      "linear-gradient(135deg, rgba(220,38,38,0.08) 0%, rgba(239,68,68,0.08) 100%)",
    trackBorder: "rgba(220,38,38,0.3)",
    fillGradient: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
    labelGradient: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
    chevronColor: "#dc2626",
    thumbGradient: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
    thumbShadowDrag: "0 6px 20px rgba(220,38,38,0.45)",
    thumbShadowIdle: "0 3px 10px rgba(220,38,38,0.3)",
    successGradient: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
  },
};

export const SlideToConfirm = ({
  label = "Slide to confirm",
  onConfirm,
  disabled = false,
  loading = false,
  variant = "confirm",
}: SlideToConfirmProps) => {
  const styles = VARIANT_STYLES[variant];

  const trackRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [springing, setSpringing] = useState(false);
  const startXRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const getMaxX = () => {
    const trackWidth = trackRef.current?.clientWidth ?? 0;
    return trackWidth - THUMB_SIZE - 0;
  };

  const clamp = (val: number) => Math.max(0, Math.min(val, getMaxX()));

  // ── Pointer handlers ──────────────────────────────────────────────────────
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || loading || confirmed) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      setSpringing(false);
      startXRef.current = e.clientX - dragX;
    },
    [disabled, loading, confirmed, dragX],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const newX = clamp(e.clientX - startXRef.current);
        setDragX(newX);
      });
    },
    [isDragging],
  );

  const onPointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const max = getMaxX();
    if (dragX / max >= CONFIRM_THRESHOLD) {
      setDragX(max);
      setConfirmed(true);
      setTimeout(() => {
        onConfirm();
        setTimeout(() => {
          setConfirmed(false);
          setSpringing(true);
          setDragX(0);
          setTimeout(() => setSpringing(false), SPRING_DURATION);
        }, 1000);
      }, 200);
    } else {
      setSpringing(true);
      setDragX(0);
      setTimeout(() => setSpringing(false), SPRING_DURATION);
    }
  }, [isDragging, dragX, onConfirm]);

  // ── Derived values ────────────────────────────────────────────────────────
  const max = getMaxX();
  const progress = max > 0 ? dragX / max : 0;
  const labelOpacity = Math.max(0, 1 - progress * 2.2);

  const thumbTransition =
    springing || confirmed
      ? `transform ${SPRING_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1)`
      : "none";

  return (
    <div
      ref={trackRef}
      className="relative select-none overflow-hidden rounded-full"
      style={{
        height: `${THUMB_SIZE + 4}px`,
        background: disabled || loading ? "#e5e7eb" : styles.trackBg,
        border: "2px solid",
        borderColor: disabled || loading ? "#d1d5db" : styles.trackBorder,
        cursor: disabled || loading ? "not-allowed" : "default",
        transition: "border-color 0.2s",
      }}
      aria-label={label}
      role="slider"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Track fill */}
      <div
        className="absolute top-0 left-0 h-full rounded-full pointer-events-none"
        style={{
          width: `${dragX + THUMB_SIZE + 2}px`,
          background: confirmed ? styles.successGradient : styles.fillGradient,
          opacity: confirmed ? 1 : 0.2 + progress * 0.8,
          transition: confirmed ? "background 0.3s ease" : "none",
        }}
      />

      {/* Shimmer label */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: labelOpacity,
          transition: isDragging ? "none" : "opacity 0.2s",
        }}
      >
        <span
          className="text-sm font-semibold tracking-wide"
          style={{
            background: styles.labelGradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {label}
        </span>
        {/* Animated chevrons */}
        <div className="flex ml-1" style={{ opacity: 0.55 }}>
          {[0, 1, 2].map((i) => (
            <ChevronRight
              key={i}
              className="h-3.5 w-3.5 -ml-1.5 animate-pulse"
              style={{
                color: styles.chevronColor,
                animationDelay: `${i * 150}ms`,
                animationDuration: "1.2s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Thumb */}
      <div
        className="absolute top-[0px] left-[0px] rounded-full flex items-center justify-center shadow-lg"
        style={{
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          background: confirmed ? styles.successGradient : styles.thumbGradient,
          transform: `translateX(${dragX}px)`,
          transition: thumbTransition,
          cursor:
            disabled || loading
              ? "not-allowed"
              : isDragging
                ? "grabbing"
                : "grab",
          touchAction: "none",
          userSelect: "none",
          boxShadow: isDragging
            ? styles.thumbShadowDrag
            : styles.thumbShadowIdle,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {confirmed ? (
          variant === "danger" ? (
            <Trash2 className="h-5 w-5 text-white" />
          ) : (
            <CheckCircle2 className="h-6 w-6 text-white" />
          )
        ) : variant === "danger" ? (
          <Trash2 className="h-5 w-5 text-white" />
        ) : (
          <ChevronRight className="h-6 w-6 text-white" />
        )}
      </div>
    </div>
  );
};
