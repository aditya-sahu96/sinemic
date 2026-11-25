// CONTRACTS-V3 function signatures. Each module must export exactly these.
// Kilo Code builds the product against these signatures and must not change them.

import type {
  StackInfo, LanguageId, LanguageAdapter, SymbolGraph, Selection, ContextPack,
  Ledger, ReqStatus, Decision, Constraint, Requirement, ProviderConfig,
  ModelResult, FilePatch, CheckCommand, VerifyResult, CheckResult, UsageLimits,
} from "./types";

export * from "./types";

// modules/stack: detects languages and framework from manifest files
export declare function detectStack(projectPath: string): StackInfo;

// modules/adapters/<lang>: each adapter implements LanguageAdapter
// Registry lookup, implemented in modules/adapters/index.ts
export declare function getAdapter(id: LanguageId): LanguageAdapter;

// modules/adapters/*: extraction is done by the adapter's extract()
// Shared helper used by all adapters for the final graph shape:
export declare function buildGraph(language: LanguageId, graph: Omit<SymbolGraph, "language">): SymbolGraph;

// modules/selector: picks symbols related to the task targets
export declare function selectContext(
  graph: SymbolGraph,
  taskTargets: string[],
  maxSymbols?: number,                 // default 25
): Selection;

// modules/ledger: typed, versioned project state stored in SQLite
export interface LedgerStore {
  read(): Ledger;
  addRequirement(text: string, acceptanceTests: string[]): Requirement;
  addDecision(input: Omit<Decision, "id" | "createdAt">): Decision;
  addConstraint(text: string): Constraint;
  // Enforced rules:
  //  - transitions must follow proposed -> accepted -> implemented -> verified
  //  - only actor "verifier" may set "verified"; otherwise throws LedgerError
  setRequirementStatus(id: string, status: ReqStatus, actor: "user" | "verifier" | "model" | "system"): Requirement;
  appendEvent(actor: "user" | "verifier" | "model" | "system", type: string, payload: unknown): void;
  close(): void;
}
export declare class LedgerError extends Error {}
export declare function openLedger(dbPath: string, projectId: string): LedgerStore;

// modules/context: compiles a context pack within a token budget
export declare function compilePack(
  ledger: Ledger,
  selection: Selection,
  graph: SymbolGraph,
  budgetTokens: number,                // default 6000
): ContextPack;

// modules/model: calls providers in order, falls back on quota or network errors
export declare function complete(
  pack: ContextPack,
  task: string,
  providers: ProviderConfig[],         // tried in order
): Promise<ModelResult>;

// modules/usage (v3): per-user, per-model daily limits stored in SQLite
export interface UsageStore {
  canUse(userId: string, modelId: string, limits: UsageLimits, now?: Date): boolean;
  record(userId: string, modelId: string, tokens: number, now?: Date): void;
  today(userId: string, modelId: string, now?: Date): { requests: number; tokens: number };
  globalToday(modelId: string, now?: Date): number;
  close(): void;
}
export declare function openUsageStore(dbPath: string): UsageStore;

// modules/verifier: runs checks in a copy of the project, never in the original
export declare function applyPatches(
  projectPath: string,
  patches: FilePatch[],
  workDir: string,
): string;                             // returns path of the patched copy

export declare function verify(
  projectPath: string,
  checks: CheckCommand[],
): Promise<VerifyResult>;

export declare function secretScan(projectPath: string): CheckResult;

// Verifier flow used by the product: apply in a copy, run checks, report.
// Only a passing VerifyResult may lead to ledger.setRequirementStatus(id, "verified", "verifier").