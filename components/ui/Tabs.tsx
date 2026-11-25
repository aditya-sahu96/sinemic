"use client";

import { HTMLAttributes, forwardRef, useState, createContext, useContext, ReactNode, useId } from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within Tabs");
  }
  return context;
}

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, onValueChange, children, className, ...props }, ref) => {
    const [value, setValue] = useState(defaultValue);
    const baseId = useId();

    const handleChange = (newValue: string) => {
      setValue(newValue);
      onValueChange?.(newValue);
    };

    return (
      <TabsContext.Provider value={{ value, onValueChange: handleChange, baseId }}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = "Tabs";

interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation="horizontal"
        className={cn("inline-flex items-center bg-background rounded-[var(--radius-control)] p-1 gap-1", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsList.displayName = "TabsList";

interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, children, className = "", disabled, ...props }, ref) => {
    const { value: currentValue, onValueChange, baseId } = useTabsContext();
    const isActive = currentValue === value;

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        aria-controls={`${baseId}-panel-${value}`}
        id={`${baseId}-trigger-${value}`}
        data-state={isActive ? "active" : "inactive"}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-[var(--radius-control)] transition-base",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "data-[state=active]:bg-primary data-[state=active]:text-white",
          "data-[state=inactive]:text-text-muted data-[state=inactive]:hover:text-text-primary data-[state=inactive]:hover:bg-background",
          className
        )}
        disabled={disabled}
        onClick={() => !disabled && onValueChange(value)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, children, className = "", ...props }, ref) => {
    const { value: currentValue, baseId } = useTabsContext();
    const isActive = currentValue === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`${baseId}-panel-${value}`}
        aria-labelledby={`${baseId}-trigger-${value}`}
        className={cn("mt-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };