"use client";

import { HTMLAttributes, forwardRef } from "react";

export type BadgeVariant =
  | "passed"
  | "failed"
  | "skipped"
  | "verified"
  | "implemented"
  | "proposed";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  passed: "bg-success/10 text-success border-success/20",
  failed: "bg-danger/10 text-danger border-danger/20",
  skipped: "bg-warning/10 text-warning border-warning/20",
  verified: "bg-accent/10 text-accent border-accent/20",
  implemented: "bg-primary/10 text-primary border-primary/20",
  proposed: "bg-text-muted/10 text-text-muted border-text-muted/20",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant, className = "", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-control)] text-xs font-medium border transition-base ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";