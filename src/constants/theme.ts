/**
 * Theme Constants
 * Centralized theme values for consistent styling across the application
 */

// Gradient Definitions
export const GRADIENTS = {
  // Primary gradient: Purple to Blue (most commonly used)
  PRIMARY: "linear-gradient(135deg, #f59e42 0%, #ff6b6b 100%)",
  //   PRIMARY: "linear-gradient(to right, #9333ea, #2563eb)",

  // Secondary gradient: Blue to Purple (used in TravelExpenses)
  //   SECONDARY: "linear-gradient(to right, #2563eb, #7c3aed)",
  SECONDARY: "linear-gradient(135deg, #f59e42 0%, #ff6b6b 100%)",

  // Chat gradient: Purple to Blue with opacity
  CHAT: "linear-gradient(135deg, rgba(147, 51, 234, 1) 0%, rgba(37, 99, 235, 1) 100%)",

  // Stats gradient: Orange to Pink (used in StatisticsCharts)
  STATS: "linear-gradient(135deg, #f59e42 0%, #ff6b6b 100%)",
  //   STATS: "linear-gradient(225deg, #FFE29F 0%, #FFA99F 48%, #FF719A 100%)",
} as const;

// Helper function to apply gradient to text (for inline styles)
export const getTextGradientStyle = (gradient: string = GRADIENTS.PRIMARY) => ({
  background: gradient,
  WebkitTextFillColor: "transparent",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
});

// Helper function to apply gradient to background (for inline styles)
export const getBackgroundGradientStyle = (
  gradient: string = GRADIENTS.PRIMARY,
) => ({
  background: gradient,
});

// CSS class names for gradients (to be used with Tailwind or custom CSS)
export const GRADIENT_CLASSES = {
  PRIMARY_BG: "gradient-primary-bg",
  PRIMARY_TEXT: "gradient-primary-text",
  SECONDARY_BG: "gradient-secondary-bg",
  SECONDARY_TEXT: "gradient-secondary-text",
  CHAT_BG: "gradient-chat-bg",
  STATS_BG: "gradient-stats-bg",
} as const;
