"use client";

import { HTMLAttributes, forwardRef } from "react";
import { CheckIcon, ChevronRightIcon } from "./icons";

export const STEPS = [
  { id: "map", label: "Map" },
  { id: "describe", label: "Describe" },
  { id: "review", label: "Review" },
  { id: "check", label: "Check" },
  { id: "approve", label: "Approve" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

interface StepIndicatorProps {
  currentStep: StepId;
  className?: string;
}

const stepOrder = STEPS.map((s) => s.id);

export function StepIndicator({ currentStep, className = "" }: StepIndicatorProps) {
  const currentIndex = stepOrder.indexOf(currentStep);

  return (
    <nav className={`flex items-center gap-2 ${className}`} aria-label="Progress steps">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === STEPS.length - 1;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-base ${
                  isCompleted
                    ? "bg-success text-white"
                    : isCurrent
                    ? "bg-primary text-white"
                    : "bg-background border border-border text-text-muted"
                }`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? <CheckIcon className="w-4 h-4" /> : <span>{index + 1}</span>}
              </div>
              <span
                className={`text-sm font-medium transition-base ${
                  isCompleted || isCurrent ? "text-text-primary" : "text-text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`hidden md:block w-16 h-0.5 rounded mx-1 transition-base ${
                  isCompleted ? "bg-success" : "bg-border"
                }`}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function StepIndicatorMobile({ currentStep }: { currentStep: StepId }) {
  const currentIndex = stepOrder.indexOf(currentStep);
  const currentStepData = STEPS[currentIndex];

  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-surface border border-border rounded-[var(--radius-card)]">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-medium">
          {currentIndex + 1}
        </div>
        <div>
          <p className="text-xs text-text-muted">Step {currentIndex + 1} of {STEPS.length}</p>
          <p className="font-medium text-text-primary">{currentStepData.label}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {STEPS.map((step, index) => (
          <div
            key={step.id}
            className={`w-2 h-2 rounded-full transition-base ${
              index <= currentIndex ? "bg-primary" : "bg-border"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}