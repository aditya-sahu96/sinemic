"use client";

import { useEffect, useState } from "react";
import { XIcon } from "./icons";
import { Button } from "./Button";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  onClose: (id: string) => void;
  duration?: number;
}

const typeStyles: Record<ToastType, { bg: string; border: string; iconColor: string }> = {
  success: { bg: "bg-success/10", border: "border-success/20", iconColor: "text-success" },
  error: { bg: "bg-danger/10", border: "border-danger/20", iconColor: "text-danger" },
  info: { bg: "bg-primary/10", border: "border-primary/20", iconColor: "text-primary" },
};

const typeIcons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export function Toast({ id, type, title, message, onClose, duration = 5000 }: ToastProps) {
  const [visible, setVisible] = useState(true);
  const styles = typeStyles[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(id), 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-[var(--radius-card)] border transition-base animate-slide-in ${styles.bg} ${styles.border}`}
      role="alert"
      aria-live="polite"
    >
      <span className={styles.iconColor} aria-hidden="true">
        {typeIcons[type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary">{title}</p>
        {message && <p className="text-text-muted text-sm mt-0.5">{message}</p>}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setVisible(false);
          setTimeout(() => onClose(id), 200);
        }}
        aria-label="Dismiss"
      >
        <XIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: string; type: ToastType; title: string; message?: string }>;
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-96 max-w-[calc(100vw-1rem)]"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}