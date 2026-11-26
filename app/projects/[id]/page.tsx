"use client";

import { useCallback, useEffect, useState } from "react";
import type { Ledger } from "@/engine/contracts";
import type { CheckResult, ContextPack, Selection, FilePatch } from "@/engine/contracts/types";
import { StepIndicator, STEPS, type StepId } from "@/components/ui/StepIndicator";
import { Textarea, EmptyState, Tabs, TabsList, TabsTrigger, TabsContent, Card, CardContent, Button, Badge, ToastProvider, useToast, FirstVisitTour } from "@/components/ui";
import { FileIcon, CodeIcon, SearchIcon, ChevronDownIcon, ChevronUpIcon, XIcon, SparklesIcon, LoaderIcon, InfoIcon } from "@/components/ui/icons";

interface SymbolNode {
  id: string;
  name: string;
  kind: string;
  filePath: string;
  startLine: number;
  endLine: number;
  signature?: string;
}

interface SymbolEdge {
  from: string;
  to: string;
  kind: string;
  resolved: boolean;
}

interface SymbolGraph {
  language: string;
  nodes: SymbolNode[];
  edges: SymbolEdge[];
  coverage: {
    filesParsed: number;
    filesSkipped: number;
    skippedReasons: string[];
  };
}

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
 
   `;

export default function ProjectWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ToastProvider>
      <ProjectWorkspacePageInner params={params} />
    </ToastProvider>
  );
}

function ProjectWorkspacePageInner({ params }: { params: Promise<{ id: string }> }) {
  const [currentStep, setCurrentStep] = useState<StepId>("describe");
  const [task, setTask] = useState("");
  const [, setActiveTab] = useState("diff");
  const [showContext, setShowContext] = useState(false);
  const [graph, setGraph] = useState<SymbolGraph | null>(null);
  const [extracting, setExtracting] = useState(true);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState("");
  const [selectedTargetFiles, setSelectedTargetFiles] = useState<string[]>([]);
  const [pack] = useState<ContextPack | null>(null);
  const [selection] = useState<Selection | null>(null);
  const [contextLoading] = useState(false);
  const [contextError] = useState<string | null>(null);
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  const [patches, setPatches] = useState<FilePatch[]>([]);
  const [runLoading, setRunLoading] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [verifyResults, setVerifyResults] = useState<CheckResult[] | null>(null);
  const [verifySource, setVerifySource] = useState<"imported" | "sample" | "demo" | null>(null);
  const [verifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [requestsLeft, setRequestsLeft] = useState<number | null>(null);
  const [requestsLimit, setRequestsLimit] = useState<number | null>(null);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const { addToast } = useToast();

  const requirementsList =
    ledger && ledger.requirements.length > 0 ? (
      <div className="space-y-2">
        {ledger.requirements.map((req) => (
          <div
            key={req.id}
            className="p-3 bg-card border border-border rounded-[var(--radius-control)]"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-text-heading">{req.id}</span>
              <Badge
                variant={
                  req.status === "verified"
                    ? "verified"
                    : req.status === "implemented"
                      ? "implemented"
                      : "proposed"
                }
                className="text-xs"
              >
                {req.status}
              </Badge>
            </div>
            <p className="text-xs text-text-secondary">{req.text}</p>
            {req.acceptanceTests.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {req.acceptanceTests.map((at, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-card border border-border px-2 py-0.5 rounded text-text-secondary font-mono"
                  >
                    {at}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <EmptyState
        icon="file"
        title="No requirements"
        description="Requirements appear here once seeded."
      />
    );

  const decisionsList =
    ledger && ledger.decisions.length > 0 ? (
      <div className="space-y-2">
        {ledger.decisions.map((d) => (
          <div
            key={d.id}
            className="p-3 bg-card border border-border rounded-[var(--radius-control)]"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-text-heading">{d.id}</span>
              <span className="text-xs text-text-secondary">{d.createdAt.slice(0, 10)}</span>
            </div>
            <p className="text-xs text-text-secondary mb-2">{d.chosen}</p>
            <div className="mb-2">
              <span className="text-[10px] text-text-secondary">Rejected:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {d.rejected.map((r, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-card border border-border px-2 py-0.5 rounded text-text-secondary font-mono line-through"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-text-heading">{d.reason}</p>
          </div>
        ))}
      </div>
    ) : (
      <EmptyState
        icon="file"
        title="No decisions"
        description="Decisions appear here once seeded."
      />
    );

  const eventsList =
    ledger && ledger.events.length > 0 ? (
      <div className="space-y-1">
        {ledger.events.map((e) => (
          <div
            key={e.id}
            className="p-3 bg-card border border-border rounded-[var(--radius-control)]"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-text-heading">{e.type}</span>
              <Badge variant="proposed" className="text-xs">
                {e.actor}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>{e.at.slice(0, 19).replace("T", " ")}</span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <EmptyState
        icon="file"
        title="No events"
        description="Events appear here once seeded."
      />
    );

  function toggleTargetFile(filePath: string) {
    setSelectedTargetFiles((prev) =>
      prev.includes(filePath) ? prev.filter((f) => f !== filePath) : [...prev, filePath]
    );
  }

  const runTask = useCallback(async () => {
    if (!projectId || !task.trim()) return;
    setRunLoading(true);
    setRunError(null);
    setVerifyResults(null);
    setVerifyError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, targetFiles: selectedTargetFiles }),
      });
      const data = await res.json();
      if (data.error) {
        setRunError(data.error);
        addToast({ type: "error", title: "Run failed", message: data.error || "Unknown error" });
        return;
      }
      const patchesWithOld = await Promise.all(
        (data.patches ?? []).map(async (p: FilePatch) => {
          let oldContent = "";
          try {
            const fileRes = await fetch(
              `/api/projects/${projectId}/file?path=${encodeURIComponent(p.path)}`
            );
            if (fileRes.ok) {
              const fileData = await fileRes.json();
              oldContent = fileData.content ?? "";
            }
          } catch {}
          return { ...p, oldContent };
        })
      );
      setPatches(patchesWithOld);
      setCurrentStep("review");
      addToast({ type: "success", title: "Task complete", message: `${patchesWithOld.length} file(s) changed` });

      const verifyRes = await fetch(`/api/projects/${projectId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patches: patchesWithOld }),
      });
      const verifyData = await verifyRes.json();
      if (verifyData.error) {
        setVerifyError(verifyData.error);
        addToast({ type: "error", title: "Verification failed", message: verifyData.error || "Unknown error" });
      } else {
        setVerifyResults(verifyData.checks ?? []);
        setVerifySource(verifyData.source ?? null);
        setCurrentStep("check");
        addToast({ type: "success", title: "Verification complete", message: `All checks finished` });
      }
      if (data.requestsLeft !== undefined) {
        setRequestsLeft(data.requestsLeft);
        setRequestsLimit(data.requestsLimit ?? null);
      }
    } catch {
      setRunError("Network error");
      addToast({ type: "error", title: "Network error", message: "Failed to run task" });
    } finally {
      setRunLoading(false);
    }
  }, [projectId, task, selectedTargetFiles, addToast]);

  useEffect(() => {
    params.then((p) => setProjectId(p.id));
  }, [params]);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    async function extract() {
      try {
        setExtracting(true);
        setExtractError(null);
        const res = await fetch(`/api/projects/${projectId}/extract`, { method: "POST" });
        if (!res.ok) {
          const data = await res.json();
          if (data.error === "NEED_MODULE") {
            setExtractError("NEED_MODULE");
            addToast({ type: "error", title: "Engine modules missing" });
          } else {
            setExtractError(data.error || "Extraction failed");
            addToast({ type: "error", title: "Extraction failed", message: data.error || "Unknown error" });
          }
          return;
        }
        const data = await res.json();
        if (!cancelled) setGraph(data.graph);
        if (!cancelled) addToast({ type: "success", title: "Symbols extracted", message: `${data.graph.nodes.length} symbols found` });
      } catch {
        if (!cancelled) setExtractError("Network error");
        if (!cancelled) addToast({ type: "error", title: "Extraction failed", message: "Network error" });
      } finally {
        if (!cancelled) setExtracting(false);
      }
    }
    extract();
    return () => { cancelled = true; };
  }, [projectId, addToast]);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    async function fetchLedger() {
      try {
        setLedgerLoading(true);
        setLedgerError(null);
        const res = await fetch(`/api/projects/${projectId}/ledger`);
        if (!res.ok) {
          const data = await res.json();
          setLedgerError(data.error || "Ledger load failed");
          return;
        }
        const data = await res.json();
        if (!cancelled) setLedger(data.ledger);
        if (!cancelled) addToast({ type: "success", title: "Ledger loaded", message: `${data.ledger.requirements.length} requirements` });
      } catch {
        if (!cancelled) setLedgerError("Network error");
        if (!cancelled) addToast({ type: "error", title: "Ledger load failed", message: "Network error" });
      } finally {
        if (!cancelled) setLedgerLoading(false);
      }
    }
    fetchLedger();
    return () => { cancelled = true; };
  }, [projectId, addToast]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter" && (event.target as HTMLElement).closest("textarea,input,button") === null) {
        runTask();
      }
      if (event.key === "Escape") {
        setShowContext(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [runTask, setShowContext]);

  const symbolsByFile = graph
    ? Object.entries(
        graph.nodes.reduce((acc, node) => {
          const rel = node.filePath;
          if (!acc[rel]) acc[rel] = [];
          acc[rel].push(node);
          return acc;
        }, {} as Record<string, SymbolNode[]>)
      )
    : [];

  function kindIcon(kind: string) {
    switch (kind) {
      case "function": return <CodeIcon className="w-4 h-4 text-text-secondary flex-shrink-0" />;
      case "class": return <CodeIcon className="w-4 h-4 text-text-secondary flex-shrink-0" />;
      case "type": return <CodeIcon className="w-4 h-4 text-text-secondary flex-shrink-0" />;
      case "variable": return <CodeIcon className="w-4 h-4 text-text-secondary flex-shrink-0" />;
      case "import": return <SearchIcon className="w-4 h-4 text-text-secondary flex-shrink-0" />;
      case "export": return <SearchIcon className="w-4 h-4 text-text-secondary flex-shrink-0" />;
      default: return <FileIcon className="w-4 h-4 text-text-secondary flex-shrink-0" />;
    }
  }

  return (
    <div className="min-h-screen bg-background">
        <FirstVisitTour />
        <div className="border-b border-border bg-card/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 hidden md:block">
          <StepIndicator currentStep={currentStep} />
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-4 md:hidden">
          <StepIndicatorMobile currentStep={currentStep} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMobileDrawer((prev) => !prev)}
            className="w-full"
          >
            {showMobileDrawer ? (
              <>
                <XIcon className="w-4 h-4 mr-2" />
                Hide files
              </>
            ) : (
              <>
                <ChevronDownIcon className="w-4 h-4 mr-2" />
                Files & Symbols
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Files & Symbols */}
        <aside className="lg:col-span-3 hidden lg:block">
          <Card className="h-[calc(100vh-14rem)] sticky top-20 overflow-hidden">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-heading">Files & Symbols</h3>
                {extracting && (
                  <LoaderIcon className="w-4 h-4 text-primary animate-spin" />
                )}
                {!extracting && graph && (
                  <Badge variant="proposed" className="text-xs">{graph.nodes.length} symbols</Badge>
                )}
                {!extracting && !graph && !extractError && (
                  <Badge variant="proposed" className="text-xs">0 symbols</Badge>
                )}
              </div>
              <div className="flex-1 overflow-y-auto space-y-1">
                {extracting ? (
                  <div className="flex items-center justify-center h-full">
                    <LoaderIcon className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : extractError === "NEED_MODULE" ? (
                  <EmptyState
                    icon="alert"
                    title="Engine modules missing"
                    description="The stack detection or adapter modules are not available."
                  />
                ) : extractError ? (
                  <EmptyState
                    icon="alert"
                    title="Extraction failed"
                    description={extractError}
                  />
                ) : symbolsByFile.length > 0 ? (
                  symbolsByFile.map(([filePath, nodes], fileIndex) => (
                    <div key={fileIndex} className="space-y-1">
                      <div
                        className="px-2 py-1 text-xs text-text-secondary font-mono uppercase tracking-wider cursor-pointer select-none"
                        onClick={() => toggleTargetFile(filePath)}
                      >
                        {filePath}
                        {selectedTargetFiles.includes(filePath) && (
                          <span className="text-primary"> ✓</span>
                        )}
                      </div>
                      {nodes.map((node, nodeIndex) => (
                        <button
                          key={`${fileIndex}-${nodeIndex}`}
                          className="w-full text-left px-3 py-2 text-sm rounded-[var(--radius-control)] hover:bg-card transition-base flex items-center gap-2"
                        >
                          {kindIcon(node.kind)}
                          <span className="truncate font-mono text-text-heading">{node.name}</span>
                          <Badge variant="proposed" className="text-[10px] ml-auto capitalize">{node.kind}</Badge>
                        </button>
                      ))}
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon="file"
                    title="No symbols found"
                    description="The project may be empty or extraction returned no results."
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Center Column - Task & Context */}
        <main className="lg:col-span-6 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-text-heading">Task</h3>
              {selectedTargetFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs text-text-secondary">Targets:</span>
                  {selectedTargetFiles.map((fp) => (
                    <span
                      key={fp}
                      className="text-xs bg-card border border-border px-2 py-1 rounded text-text-heading font-mono truncate max-w-[200px] flex items-center gap-1 cursor-pointer hover:bg-card-elevated"
                      onClick={() => toggleTargetFile(fp)}
                    >
                      {fp}
                      <XIcon className="w-3 h-3" />
                    </span>
                  ))}
                </div>
              )}
              <Textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Describe what you want to build... e.g., 'Add Stripe payment integration to the checkout flow with cart, payment form, and order confirmation.'"
                rows={4}
                className="font-mono text-sm"
              />
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-text-secondary">
                    {task.length} characters
                  </p>
                  {requestsLeft !== null && requestsLimit !== null && (
                    <p className="text-xs text-text-secondary">
                      {requestsLeft} of {requestsLimit} requests left today
                    </p>
                  )}
                  {runError && (
                    <p className="text-xs text-danger">{runError}</p>
                  )}
                </div>
                <Button
                  size="lg"
                  disabled={
                    !task.trim() ||
                    contextLoading ||
                    runLoading ||
                    (requestsLeft !== null && requestsLeft <= 0)
                  }
                  onClick={runTask}
                  className="text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3"
                >
                  {runLoading ? (
                    <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <SparklesIcon className="w-4 h-4 mr-2" />
                  )}
                  {runLoading
                    ? "Running…"
                    : requestsLeft !== null && requestsLeft <= 0
                      ? "Daily limit reached"
                      : "Run task"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text-heading">Context Preview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowContext(!showContext)}
                >
                  {showContext ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                </Button>
              </div>
              {contextError === "NEED_MODULE" && (
                <EmptyState
                  icon="alert"
                  title="Engine modules missing"
                  description="The selector, context, or ledger modules are not available."
                />
              )}
              {contextError && contextError !== "NEED_MODULE" && (
                <EmptyState
                  icon="alert"
                  title="Context pack failed"
                  description={contextError}
                />
              )}
              {contextLoading && (
                <div className="flex items-center justify-center py-8">
                  <LoaderIcon className="w-6 h-6 text-primary animate-spin" />
                </div>
              )}
              {!contextLoading && pack && showContext && (
                <>
                  <div className="bg-card border border-border rounded-[var(--radius-control)] p-4 font-mono text-xs text-text-secondary max-h-64 overflow-y-auto">
                    <pre>{pack.text}</pre>
                  </div>
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold text-text-heading text-sm">Included</h4>
                    <div className="flex flex-wrap gap-2">
                      {pack.included.map((id: string) => (
                        <span
                          key={id}
                          className="text-xs bg-card border border-border px-2 py-1 rounded text-text-heading font-mono truncate max-w-[200px]"
                        >
                          {id}
                          <span className="text-text-secondary"> ({selection?.reasons?.[id] || "selected"})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  {pack.dropped.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-semibold text-text-heading text-sm">Dropped (budget limit)</h4>
                      <div className="space-y-1">
                         {pack.dropped.map((d: { id: string; reason: string }) => (
                          <div
                            key={d.id}
                            className="flex items-start gap-2 p-3 bg-card border border-border rounded-[var(--radius-control)]"
                          >
                            <XIcon className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-medium text-text-heading text-xs font-mono">{d.id}</span>
                              <p className="text-xs text-text-secondary mt-1">{d.reason === "budget" ? "Cut by token budget (6000)" : d.reason}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {pack.doNotRePropose.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-semibold text-text-heading text-sm">Do Not Re-Propose</h4>
                      <div className="space-y-1">
                        {pack.doNotRePropose.map((dnp: string, i: number) => (
                          <div
                            key={i}
                            className="p-3 bg-card border border-border rounded-[var(--radius-control)]"
                          >
                            <p className="text-xs text-text-secondary">{dnp}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-2 flex items-center justify-between text-xs text-text-secondary">
                    <span>Tokens: {pack.tokenEstimate} / {pack.budget}</span>
                    <span>Symbols: {pack.included.length} included, {pack.dropped.length} dropped</span>
                  </div>
                </>
              )}
              {!contextLoading && !pack && !contextError && showContext && (
                <EmptyState
                  icon="file"
                  title="No context yet"
                  description="Enter a task and select target files, then click Run task."
                />
              )}
            </CardContent>
          </Card>
        </main>

        {/* Right Column - Tabs: Diff, Checks, Ledger */}
        <aside className="lg:col-span-3">
          <Card className="lg:h-[calc(100vh-14rem)] lg:sticky lg:top-20 overflow-hidden">
            <CardContent className="p-0 h-full flex flex-col">
              <Tabs defaultValue="diff" onValueChange={setActiveTab}>
                <TabsList className="p-2 border-b border-border bg-card flex-1">
                  <TabsTrigger value="diff">Diff</TabsTrigger>
                  <TabsTrigger value="checks">Checks</TabsTrigger>
                  <TabsTrigger value="ledger">Ledger</TabsTrigger>
                </TabsList>
                <TabsContent value="diff" className="flex-1 p-4 overflow-y-auto">
                  {runError && (
                    <EmptyState
                      icon="alert"
                      title="Run failed"
                      description={runError}
                    />
                  )}
                  {patches.length > 0 && (
                    <div className="bg-card border border-border rounded-[var(--radius-control)] p-0 max-h-[400px] overflow-y-auto">
                      {patches.map((p) => (
                        <div key={p.path} className="border-b border-border last:border-0">
                          <div className="px-4 py-2 bg-card/50 text-xs font-mono text-text-secondary border-b border-border">
                            {p.path}
                          </div>
                          <div className="px-4 py-2 font-mono text-xs">
                            {simpleDiff(p.oldContent ?? "", p.newContent).map((line, i) => (
                              <div
                                key={i}
                                className={`flex items-start gap-1 ${line.type === "add" ? "bg-success/10" : line.type === "remove" ? "bg-danger/10" : ""}`}
                              >
                                <span className={`w-4 text-center select-none ${line.type === "add" ? "text-success" : line.type === "remove" ? "text-danger" : "text-text-secondary"}`}>
                                  {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
                                </span>
                                <span className="whitespace-pre break-all">{line.content.slice(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!patches.length && !runError && task && (
                    <div className="bg-card border border-border rounded-[var(--radius-control)] p-4 font-mono text-xs text-text-heading max-h-[400px] overflow-y-auto">
                      <pre>{mockDiff}</pre>
                    </div>
                  )}
                  {!task && (
                    <EmptyState
                      icon="code"
                      title="No diff yet"
                      description="Run a task to see the proposed changes here."
                    />
                  )}
                </TabsContent>
                <TabsContent value="checks" className="flex-1 p-4 overflow-y-auto">
                  {verifyLoading && (
                    <div className="flex items-center justify-center py-8">
                      <LoaderIcon className="w-6 h-6 text-primary animate-spin" />
                    </div>
                  )}
                  {verifyError && (
                    <EmptyState
                      icon="alert"
                      title="Verify failed"
                      description={verifyError}
                    />
                  )}
                  {verifySource === "imported" && (
                    <Card className="mb-4 border border-border bg-info">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <InfoIcon className="w-4 h-4 mt-0.5 text-info-foreground" />
                          <div>
                            <p className="font-medium text-text-heading text-xs">Static checks only</p>
                            <p className="text-xs text-text-secondary mt-1">
                              Imported projects run secret-scan + parse checks only. Typecheck and test
                              are skipped — no code is executed.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {verifyResults && verifyResults.length > 0 && (
                    <div className="space-y-2">
                      {verifyResults.map((check) => (
                        <div
                          key={check.name}
                          className="flex items-center justify-between p-3 bg-card border border-border rounded-[var(--radius-control)]"
                        >
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={check.passed ? "passed" : check.skipped ? "skipped" : "failed"}
                              className="text-xs"
                            >
                              {check.passed ? "Passed" : check.skipped ? "Skipped" : "Failed"}
                            </Badge>
                            <span className="font-medium text-text-heading">{check.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-text-secondary font-mono">
                            {check.durationMs !== undefined && <span>{check.durationMs}ms</span>}
                            {check.skipped && <span>{check.skipReason}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!verifyResults && !verifyError && !verifyLoading && task && (
                    <EmptyState
                      icon="terminal"
                      title="No checks yet"
                      description="Run a task to see verification results."
                    />
                  )}
                  {!task && (
                    <EmptyState
                      icon="terminal"
                      title="No checks yet"
                      description="Run a task to see verification results."
                    />
                  )}
                </TabsContent>

                <TabsContent value="ledger" className="flex-1 p-4 overflow-y-auto">
                  {ledgerError && (
                    <EmptyState
                      icon="alert"
                      title="Ledger load failed"
                      description={ledgerError}
                    />
                  )}
                  {ledgerLoading && (
                    <div className="flex items-center justify-center py-8">
                      <LoaderIcon className="w-6 h-6 text-primary animate-spin" />
                    </div>
                  )}
                  {!ledgerLoading && !ledgerError && ledger && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-text-heading text-sm mb-2">
                          Requirements
                        </h4>
                        <div className="space-y-2">
                          {requirementsList}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-heading text-sm mb-2">
                          Decisions
                        </h4>
                        <div className="space-y-2">
                          {decisionsList}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-heading text-sm mb-2">
                          Events
                        </h4>
                        <div className="space-y-1">
                          {eventsList}
                        </div>
                      </div>
                    </div>
                  )}
                  {!ledgerLoading && !ledger && !ledgerError && (
                    <EmptyState
                      icon="database"
                      title="No ledger yet"
                      description="Load the project to see the ledger."
                    />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </aside>
      </div>
      {/* Mobile Files Drawer */}
      {showMobileDrawer && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 max-h-[60vh] overflow-y-auto z-20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-text-heading">Files & Symbols</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowMobileDrawer(false)}>
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-1">
          {extracting ? (
            <div className="flex items-center justify-center py-8">
              <LoaderIcon className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : extractError === "NEED_MODULE" ? (
            <EmptyState
              icon="alert"
              title="Engine modules missing"
              description="The stack detection or adapter modules are not available."
            />
          ) : extractError ? (
            <EmptyState
              icon="alert"
              title="Extraction failed"
              description={extractError}
            />
          ) : symbolsByFile.length > 0 ? (
            symbolsByFile.map(([filePath, nodes], fileIndex) => (
              <div key={fileIndex} className="space-y-1">
                <div
                  className="px-2 py-1 text-xs text-text-secondary font-mono uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => toggleTargetFile(filePath)}
                >
                  {filePath}
                  {selectedTargetFiles.includes(filePath) && (
                    <span className="text-primary"> ✓</span>
                  )}
                </div>
                {nodes.map((node, nodeIndex) => (
                  <button
                    key={`${fileIndex}-${nodeIndex}`}
                    className="w-full text-left px-3 py-2 text-sm rounded-[var(--radius-control)] hover:bg-card transition-base flex items-center gap-2"
                  >
                    {kindIcon(node.kind)}
                    <span className="truncate font-mono text-text-heading">{node.name}</span>
                    <Badge variant="proposed" className="text-[10px] ml-auto capitalize">{node.kind}</Badge>
                  </button>
                ))}
              </div>
            ))
          ) : (
            <EmptyState
              icon="file"
              title="No symbols found"
              description="The project may be empty or extraction returned no results."
            />
          )}
        </div>
      </div>
      )}
    </div>
  );
}

function simpleDiff(oldContent: string, newContent: string): { type: "add" | "remove" | "same"; content: string }[] {
  const oldLines = oldContent.split("\n");
  const newLines = newContent.split("\n");
  const result: { type: "add" | "remove" | "same"; content: string }[] = [];
  const maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];
    if (oldLine === undefined) {
      result.push({ type: "add", content: `+ ${newLine}` });
    } else if (newLine === undefined) {
      result.push({ type: "remove", content: `- ${oldLine}` });
    } else if (oldLine === newLine) {
      result.push({ type: "same", content: `  ${oldLine}` });
    } else {
      result.push({ type: "remove", content: `- ${oldLine}` });
      result.push({ type: "add", content: `+ ${newLine}` });
    }
  }
  return result;
}


function StepIndicatorMobile({ currentStep }: { currentStep: StepId }) {
  const currentIndex = STEPS.map((s) => s.id).indexOf(currentStep);
  const currentStepData = STEPS[currentIndex];

  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-[var(--radius-card)]">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-text text-sm font-medium">
          {currentIndex + 1}
        </div>
        <div>
          <p className="text-xs text-text-secondary">Step {currentIndex + 1} of {STEPS.length}</p>
          <p className="font-medium text-text-heading">{currentStepData.label}</p>
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
