"use client";

import { useState } from "react";
import { StepIndicator, STEPS, type StepId } from "@/components/ui/StepIndicator";
import { Textarea, EmptyState, Tabs, TabsList, TabsTrigger, TabsContent, Card, CardContent, Button, Badge } from "@/components/ui";
import { FileIcon, CodeIcon, SearchIcon, TerminalIcon, AlertCircleIcon, ChevronDownIcon, ChevronUpIcon, CheckIcon, XIcon, SparklesIcon } from "@/components/ui/icons";

const mockFiles = [
  { name: "src/app/checkout/page.tsx", type: "file", symbol: "CheckoutPage" },
  { name: "src/components/Cart.tsx", type: "file", symbol: "Cart" },
  { name: "src/components/PaymentForm.tsx", type: "file", symbol: "PaymentForm" },
  { name: "src/lib/stripe.ts", type: "file", symbol: "stripe" },
  { name: "src/types/order.ts", type: "file", symbol: "Order" },
  { name: "src/hooks/useCart.ts", type: "file", symbol: "useCart" },
];

const mockDiff = `diff --git a/src/components/PaymentForm.tsx b/src/components/PaymentForm.tsx
index abc123..def456 100644
--- a/src/components/PaymentForm.tsx
+++ b/src/components/PaymentForm.tsx
@@ -1,4 +1,5 @@
 import { useState } from "react";
+import { CardElement, useStripe } from "@stripe/react-stripe-js";
 
 export function PaymentForm() {
   const [error, setError] = useState<string | null>(null);
@@ -10,7 +11,10 @@ export function PaymentForm() {
   const handleSubmit = async (event: React.FormEvent) => {
     event.preventDefault();
-    // TODO: implement payment
+    const stripe = useStripe();
+    if (!stripe) return;
+    
+    const { error } = await stripe.confirmCardPayment(clientSecret, {
+      payment_method: { card: cardElement },
+    });
   };
 
   return (`;

const mockChecks = [
  { name: "TypeScript", status: "pass", duration: "2.3s" },
  { name: "ESLint", status: "pass", duration: "1.1s" },
  { name: "Vitest", status: "fail", duration: "5.2s" },
  { name: "Next.js Build", status: "pass", duration: "12.4s" },
  { name: "Secret Scan", status: "pass", duration: "0.8s" },
];

const mockLedger = [
  { step: "Map", model: "Claude 3.5 Sonnet", tokens: 2847, time: "14:23" },
  { step: "Describe", model: "GPT-4o", tokens: 5231, time: "14:25" },
  { step: "Review", model: "Claude 3.5 Sonnet", tokens: 1923, time: "14:27" },
  { step: "Check", model: "Gemini 1.5 Pro", tokens: 4102, time: "14:29" },
  { step: "Approve", model: "Human", tokens: 0, time: "14:30" },
];

export default function ProjectWorkspacePage() {
  const [currentStep, setCurrentStep] = useState<StepId>("describe");
  const [task, setTask] = useState("");
  const [activeTab, setActiveTab] = useState("diff");
  const [showContext, setShowContext] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-surface/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <StepIndicator currentStep={currentStep} />
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-4 md:hidden">
          <StepIndicatorMobile currentStep={currentStep} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Files & Symbols */}
        <aside className="lg:col-span-3 hidden lg:block">
          <Card className="h-[calc(100vh-14rem)] sticky top-20 overflow-hidden">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">Files & Symbols</h3>
                <Badge variant="proposed" className="text-xs">{mockFiles.length} files</Badge>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1">
                {mockFiles.map((file, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 text-sm rounded-[var(--radius-control)] hover:bg-background transition-base flex items-center gap-2"
                  >
                    <FileIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <span className="truncate font-mono text-text-primary">{file.name}</span>
<Badge variant="proposed" className="text-xs ml-auto">{file.symbol}</Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Center Column - Task & Context */}
        <main className="lg:col-span-6 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-text-primary">Task</h3>
              <Textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Describe what you want to build... e.g., 'Add Stripe payment integration to the checkout flow with cart, payment form, and order confirmation.'"
                rows={4}
                className="font-mono text-sm"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-muted">
                  {task.length} characters
                </p>
                <Button
                  size="lg"
                  disabled={!task.trim()}
                  onClick={() => setCurrentStep("review")}
                >
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Run task
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text-primary">Context Preview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowContext(!showContext)}
                >
                  {showContext ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                </Button>
              </div>
              {showContext && (
                <div className="bg-background border border-border rounded-[var(--radius-control)] p-4 font-mono text-xs text-text-muted max-h-64 overflow-y-auto">
                  <pre>{`// Context Pack: sample-checkout
// Generated: 2026-11-25T14:30:00Z

// SPEC
Build a TypeScript checkout flow with:
- Cart management (add/remove/update items)
- Stripe payment integration
- Order confirmation page

// DECISIONS
- Use @stripe/react-stripe-js for PaymentElement
- Cart state in React Context + localStorage persistence
- Server actions for order creation

// FILE TREE
src/
  app/
    checkout/
      page.tsx (CheckoutPage)
    order/
      [id]/
        page.tsx (OrderConfirmation)
  components/
    Cart.tsx (Cart)
    PaymentForm.tsx (PaymentForm)
  lib/
    stripe.ts (stripe client)
  hooks/
    useCart.ts (useCart)

// RECENT CHANGES
- Added PaymentForm with Stripe Elements
- Implemented useCart hook
- Created order confirmation page

// TEST RESULTS
✓ TypeScript: pass
✓ ESLint: pass
✗ Vitest: 2 failing (PaymentForm mocks)
✓ Build: pass
✓ Secret Scan: pass`}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Right Column - Tabs: Diff, Checks, Ledger */}
        <aside className="lg:col-span-3 hidden lg:block">
          <Card className="h-[calc(100vh-14rem)] sticky top-20 overflow-hidden">
            <CardContent className="p-0 h-full flex flex-col">
              <Tabs defaultValue="diff" onValueChange={setActiveTab}>
                <TabsList className="p-2 border-b border-border bg-background flex-1">
                  <TabsTrigger value="diff">Diff</TabsTrigger>
                  <TabsTrigger value="checks">Checks</TabsTrigger>
                  <TabsTrigger value="ledger">Ledger</TabsTrigger>
                </TabsList>
                <TabsContent value="diff" className="flex-1 p-4 overflow-y-auto">
                  <EmptyState
                    icon="code"
                    title="No diff yet"
                    description="Run a task to see the proposed changes here."
                  />
                  {task && (
                    <div className="bg-background border border-border rounded-[var(--radius-control)] p-4 font-mono text-xs text-text-primary max-h-[400px] overflow-y-auto">
                      <pre>{mockDiff}</pre>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="checks" className="flex-1 p-4 overflow-y-auto">
                  <EmptyState
                    icon="terminal"
                    title="No checks yet"
                    description="Run a task to see verification results."
                  />
                  {task && (
                    <div className="space-y-2">
                      {mockChecks.map((check, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-background border border-border rounded-[var(--radius-control)]"
                        >
                          <div className="flex items-center gap-3">
                            {check.status === "pass" ? (
                              <CheckIcon className="w-5 h-5 text-success" />
                            ) : (
                              <XIcon className="w-5 h-5 text-error" />
                            )}
                            <span className="font-medium text-text-primary">{check.name}</span>
                          </div>
                          <span className="text-sm text-text-muted font-mono">{check.duration}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="ledger" className="flex-1 p-4 overflow-y-auto">
                  <EmptyState
                    icon="database"
                    title="No ledger entries"
                    description="Run a task to see the execution ledger."
                  />
                  {task && (
                    <div className="space-y-2">
                      {mockLedger.map((entry, index) => (
                        <div
                          key={index}
                          className="p-3 bg-background border border-border rounded-[var(--radius-control)]"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-text-primary">{entry.step}</span>
                            <Badge variant="implemented" className="text-xs">{entry.model}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-text-muted">
                            <span>Tokens: {entry.tokens.toLocaleString()}</span>
                            <span>{entry.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Mobile Files Drawer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 max-h-[60vh] overflow-y-auto">
        <h3 className="font-semibold text-text-primary mb-3">Files & Symbols</h3>
        <div className="space-y-1">
          {mockFiles.map((file, index) => (
            <button
              key={index}
              className="w-full text-left px-3 py-2 text-sm rounded-[var(--radius-control)] hover:bg-background transition-base flex items-center gap-2"
            >
              <FileIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
              <span className="truncate font-mono text-text-primary">{file.name}</span>
              <Badge variant="proposed" className="text-xs ml-auto">{file.symbol}</Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepIndicatorMobile({ currentStep }: { currentStep: StepId }) {
  const currentIndex = STEPS.map((s) => s.id).indexOf(currentStep);
  const currentStepData = STEPS[currentIndex];

  return (
    <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-[var(--radius-card)]">
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
            className={`w-2 h-2 rounded-full transition-base ${index <= currentIndex ? "bg-primary" : "bg-border"}`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}