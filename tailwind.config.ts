import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "text-primary": "var(--color-text-primary)",
        "text-muted": "var(--color-text-muted)",
        border: "var(--color-border)",
        danger: "var(--color-danger)",
        warning: "var(--color-warning)",
        success: "var(--color-success)",
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
        code: ["var(--font-code)"],
      },
      borderRadius: {
        card: "var(--radius-card)",
        control: "var(--radius-control)",
      },
      spacing: {
        unit: "var(--spacing-unit)",
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        12: "var(--space-12)",
      },
      transitionDuration: {
        DEFAULT: "var(--motion-duration)",
      },
      transitionTimingFunction: {
        DEFAULT: "var(--motion-easing)",
      },
    },
  },
  plugins: [],
};

export default config;