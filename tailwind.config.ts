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
        "primary-text": "var(--color-primary-text)",
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "surface-elevated": "var(--color-surface-elevated)",
        card: "var(--color-card)",
        "card-elevated": "var(--color-card-elevated)",
        "text-heading": "var(--color-text-heading)",
        "text-body": "var(--color-text-body)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        "text-disabled": "var(--color-text-disabled)",
        border: "var(--color-border)",
        "border-strong": "var(--color-border-strong)",
        "border-active": "var(--color-border-active)",
        danger: "var(--color-danger)",
        "danger-text": "var(--color-danger-text)",
        success: "var(--color-success)",
        "success-text": "var(--color-success-text)",
        "gradient-coral": "var(--color-gradient-coral)",
        "gradient-peach": "var(--color-gradient-peach)",
        "gradient-pink": "var(--color-gradient-pink)",
        "gradient-magenta": "var(--color-gradient-magenta)",
        "gradient-purple": "var(--color-gradient-purple)",
        "gradient-violet": "var(--color-gradient-violet)",
        "gradient-deep-blue": "var(--color-gradient-deep-blue)",
        "gradient-cyan": "var(--color-gradient-cyan)",
        "gradient-teal": "var(--color-gradient-teal)",
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
        code: ["var(--font-code)"],
      },
      borderRadius: {
        card: "var(--radius-card)",
        control: "var(--radius-control)",
        pill: "var(--radius-pill)",
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
      boxShadow: {
        card: "var(--shadow-card)",
        glow: "var(--shadow-glow)",
      },
    },
  },
  plugins: [],
};

export default config;
