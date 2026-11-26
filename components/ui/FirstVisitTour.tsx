"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRightIcon } from "./icons";
import { Button } from "./Button";

const TOUR_KEY = "sinemic:first-visit-tour";

const TOUR_STEPS = [
  { id: "map", title: "Map your codebase", description: "Symbols and dependencies are extracted automatically so you can browse files and targets." },
  { id: "describe", title: "Describe your task", description: "Enter what you want to build and select target files, then run the task." },
  { id: "approve", title: "Review and approve", description: "Inspect the diff, run checks, and approve or reject each requirement." },
] as const;

interface FirstVisitTourProps {
  onComplete?: () => void;
}

export function FirstVisitTour({ onComplete }: FirstVisitTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let stored = false;
    try {
      stored = localStorage.getItem(TOUR_KEY) === "1";
    } catch {}
    if (stored) requestAnimationFrame(() => setDismissed(true));
  }, []);

  const step = TOUR_STEPS[stepIndex];

  const next = useCallback(() => {
    if (stepIndex >= TOUR_STEPS.length - 1) {
      try {
        localStorage.setItem(TOUR_KEY, "1");
      } catch {}
      setDismissed(true);
      onComplete?.();
      return;
    }
    setStepIndex((i) => i + 1);
  }, [stepIndex, onComplete]);

  const skip = useCallback(() => {
    try {
      localStorage.setItem(TOUR_KEY, "1");
    } catch {}
    setDismissed(true);
    onComplete?.();
  }, [onComplete]);

  if (dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label="First visit tour"
    >
      <div
        className="fixed inset-0 bg-black/40 pointer-events-auto"
        onClick={skip}
        aria-hidden="true"
      />
      <div className="relative pointer-events-auto max-w-md w-full mx-4 bg-card border border-border rounded-[var(--radius-card)] backdrop-blur-[16px] shadow-2xl overflow-hidden transition-all duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-[#080810] text-sm font-medium shrink-0 mt-0.5">
              {stepIndex + 1}
            </div>
            <div className="flex-1">
              <p className="text-xs text-text-muted uppercase tracking-wider font-medium">
                Step {stepIndex + 1} of {TOUR_STEPS.length}
              </p>
              <h3 className="font-semibold text-text-heading mt-1 mb-2">{step.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{step.description}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-border bg-card/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
            {TOUR_STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i <= stepIndex ? "bg-white" : "bg-border"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={skip}
              disabled={stepIndex === TOUR_STEPS.length - 1}
            >
              Skip tour
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={next}
            >
              {stepIndex === TOUR_STEPS.length - 1 ? "Get started" : <><ChevronRightIcon className="w-4 h-4 mr-1" /> Next</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

