/**
 * Theme Constants
 * Centralized theme values for consistent styling across the application
 * Identical to src/constants/theme.ts — duplicated here for the Next.js migration
 * Import from "@/lib/constants/theme" in migrated components
 */

export const GRADIENTS = {
  PRIMARY: "linear-gradient(135deg, #fbbf24, #f97316)",
  SECONDARY: "linear-gradient(135deg, #fbbf24, #f97316)",
  CHAT: "linear-gradient(135deg, #fbbf24, #f97316)",
  STATS: "linear-gradient(135deg, #fbbf24, #f97316)",
} as const;

export const getTextGradientStyle = (gradient: string = GRADIENTS.PRIMARY) => ({
  background: gradient,
  WebkitTextFillColor: "transparent",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
});

export const getBackgroundGradientStyle = (
  gradient: string = GRADIENTS.PRIMARY,
) => ({
  background: gradient,
});

export const GRADIENT_CLASSES = {
  PRIMARY_BG: "gradient-primary-bg",
  PRIMARY_TEXT: "gradient-primary-text",
  SECONDARY_BG: "gradient-secondary-bg",
  SECONDARY_TEXT: "gradient-secondary-text",
  CHAT_BG: "gradient-chat-bg",
  STATS_BG: "gradient-stats-bg",
} as const;
