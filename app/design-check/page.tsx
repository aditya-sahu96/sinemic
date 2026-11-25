"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Toast,
  ToastContainer,
  StepIndicator,
  StepIndicatorMobile,
  EmptyState,
  Input,
  Textarea,
  STEPS,
  type StepId,
} from "@/components/ui";

export default function DesignCheckPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [toasts, setToasts] = useState<Array<{ id: string; type: "success" | "error" | "info"; title: string; message?: string }>>([]);

  const currentStep = STEPS[currentStepIndex].id as StepId;

  const addToast = (type: "success" | "error" | "info", title: string, message?: string) => {
    const id = `${type}-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Design System Check</h1>
          <p className="text-text-muted">Review all components in one place</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Step Indicator</CardTitle>
            <CardDescription>Five steps: Map, Describe, Review, Check, Approve</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StepIndicator currentStep={currentStep} />
            <StepIndicatorMobile currentStep={currentStep} />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setCurrentStepIndex((i) => Math.max(0, i - 1))}
                disabled={currentStepIndex === 0}
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentStepIndex((i) => Math.min(STEPS.length - 1, i + 1))}
                disabled={currentStepIndex === STEPS.length - 1}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Primary, secondary, ghost variants with loading and disabled states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" loading>Loading</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cards</CardTitle>
            <CardDescription>Surface color, border, radius, padding 24px</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-text-muted">Card content with some text to show the padding and styling.</p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" size="sm">Cancel</Button>
                <Button size="sm">Save</Button>
              </CardFooter>
            </Card>
            <Card padded={false} className="p-4">
              <p className="text-text-muted">Card without default padding (padded={false})</p>
            </Card>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Passed, failed, skipped, verified, implemented, proposed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="passed">Passed</Badge>
              <Badge variant="failed">Failed</Badge>
              <Badge variant="skipped">Skipped</Badge>
              <Badge variant="verified">Verified</Badge>
              <Badge variant="implemented">Implemented</Badge>
              <Badge variant="proposed">Proposed</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Toasts</CardTitle>
            <CardDescription>Success, error, info with auto-dismiss after 5 seconds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => addToast("success", "Success!", "Operation completed successfully")}>
                Show Success
              </Button>
              <Button variant="secondary" onClick={() => addToast("error", "Error!", "Something went wrong")}>
                Show Error
              </Button>
              <Button variant="ghost" onClick={() => addToast("info", "Info", "Here is some information")}>
                Show Info
              </Button>
            </div>
            <ToastContainer toasts={toasts} onClose={removeToast} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empty States</CardTitle>
            <CardDescription>Icon, one sentence, one action button</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EmptyState
                icon="file"
                title="No files yet"
                description="Create your first file to get started"
                action={{ label: "Create file", onClick: () => addToast("info", "Create file clicked") }}
              />
              <EmptyState
                icon="search"
                title="No results found"
                description="Try adjusting your search criteria"
                action={{ label: "Clear filters", variant: "ghost", onClick: () => addToast("info", "Clear filters clicked") }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EmptyState
                icon="folder"
                title="Empty project"
                description="This project doesn't have any files yet"
                action={{ label: "Add files", onClick: () => addToast("info", "Add files clicked") }}
              />
              <EmptyState
                icon="alert"
                title="Something went wrong"
                description="We couldn't load the data. Please try again."
                action={{ label: "Retry", variant: "secondary", onClick: () => addToast("info", "Retry clicked") }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Input & Textarea</CardTitle>
            <CardDescription>Visible focus ring in primary color, error states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email"
                placeholder="you@example.com"
                helperText="We'll never share your email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error="Password must be at least 8 characters"
              />
            </div>
            <Textarea
              label="Description"
              placeholder="Enter a description..."
              helperText="Maximum 500 characters"
              rows={4}
            />
            <Textarea
              label="Code snippet"
              placeholder="Paste your code here..."
              error="Invalid syntax"
              rows={6}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Typography & Colors</CardTitle>
            <CardDescription>Design tokens applied</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-text-primary font-heading">Heading 1 (Inter)</h1>
              <h2 className="text-3xl font-semibold text-text-primary font-heading">Heading 2</h2>
              <h3 className="text-2xl font-semibold text-text-primary font-heading">Heading 3</h3>
              <p className="text-base text-text-primary font-body">Body text (Inter) - This is regular paragraph text.</p>
              <p className="text-sm text-text-muted font-body">Muted text</p>
              <code className="font-code text-sm bg-background px-1.5 py-0.5 rounded">font-code (JetBrains Mono)</code>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="w-16 h-16 rounded-[var(--radius-control)] bg-primary" title="Primary: #2563EB" />
              <div className="w-16 h-16 rounded-[var(--radius-control)] bg-accent" title="Accent: #0D9488" />
              <div className="w-16 h-16 rounded-[var(--radius-control)] bg-success" title="Success: #16A34A" />
              <div className="w-16 h-16 rounded-[var(--radius-control)] bg-warning" title="Warning: #D97706" />
              <div className="w-16 h-16 rounded-[var(--radius-control)] bg-danger" title="Danger: #DC2626" />
              <div className="w-16 h-16 rounded-[var(--radius-control)] bg-surface border border-border" title="Surface: #FFFFFF" />
              <div className="w-16 h-16 rounded-[var(--radius-control)] bg-background border border-border" title="Background: #F8FAFC" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spacing & Radius</CardTitle>
            <CardDescription>4px base unit, card 12px, control 8px</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="h-4 bg-primary" style={{ width: "var(--space-1)" }} title="space-1 (8px)" />
              <div className="h-4 bg-primary" style={{ width: "var(--space-2)" }} title="space-2 (16px)" />
              <div className="h-4 bg-primary" style={{ width: "var(--space-3)" }} title="space-3 (24px)" />
              <div className="h-4 bg-primary" style={{ width: "var(--space-4)" }} title="space-4 (32px)" />
              <div className="h-4 bg-primary" style={{ width: "var(--space-6)" }} title="space-6 (48px)" />
            </div>
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-primary rounded-[var(--radius-control)]" title="Control radius: 8px" />
              <div className="w-16 h-16 bg-primary rounded-[var(--radius-card)]" title="Card radius: 12px" />
            </div>
          </CardContent>
        </Card>

        <footer className="text-center text-text-muted text-sm py-8">
          <p>Sinemic Design System — Prototype</p>
        </footer>
      </div>
    </div>
  );
}