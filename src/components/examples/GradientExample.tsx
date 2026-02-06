import React from "react";
import {
  GRADIENTS,
  getTextGradientStyle,
  getBackgroundGradientStyle,
} from "@/constants/theme";

/**
 * Example component demonstrating how to use centralized gradient constants
 * This shows both inline style and CSS class approaches
 */
const GradientExample = () => {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Gradient Usage Examples</h1>

      {/* Example 1: Background Gradient with Helper Function */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">
          1. Background Gradient (Inline Style)
        </h2>
        <div
          className="p-6 rounded-lg text-white"
          style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
        >
          This div has a PRIMARY gradient background using helper function
        </div>
      </div>

      {/* Example 2: Background Gradient with CSS Class */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">
          2. Background Gradient (CSS Class)
        </h2>
        <div className="gradient-primary-bg p-6 rounded-lg text-white">
          This div has a PRIMARY gradient background using CSS class
        </div>
      </div>

      {/* Example 3: Text Gradient with Helper Function */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">
          3. Text Gradient (Inline Style)
        </h2>
        <p
          className="text-4xl font-bold"
          style={getTextGradientStyle(GRADIENTS.PRIMARY)}
        >
          Gradient Text using helper function
        </p>
      </div>

      {/* Example 4: Text Gradient with CSS Class */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">4. Text Gradient (CSS Class)</h2>
        <p className="text-4xl font-bold gradient-primary-text">
          Gradient Text using CSS class
        </p>
      </div>

      {/* Example 5: Using Different Gradients */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">5. Different Gradients</h2>
        <div className="space-y-3">
          <div className="gradient-primary-bg p-4 rounded-lg text-white">
            PRIMARY Gradient
          </div>
          <div className="gradient-secondary-bg p-4 rounded-lg text-white">
            SECONDARY Gradient
          </div>
          <div className="gradient-chat-bg p-4 rounded-lg text-white">
            CHAT Gradient
          </div>
          <div className="gradient-stats-bg p-4 rounded-lg text-white">
            STATS Gradient
          </div>
        </div>
      </div>

      {/* Example 6: Direct Constant Usage */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">6. Direct Constant Usage</h2>
        <div
          className="p-6 rounded-lg text-white"
          style={{ background: GRADIENTS.PRIMARY }}
        >
          Using GRADIENTS.PRIMARY directly in style object
        </div>
      </div>

      {/* Example 7: Icon with Gradient Background (Common Pattern) */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">7. Icon Container Pattern</h2>
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-[14px]"
            style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
          >
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold">Expense Category</p>
            <p
              className="text-xl font-bold"
              style={getTextGradientStyle(GRADIENTS.PRIMARY)}
            >
              ₹1,234
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradientExample;
