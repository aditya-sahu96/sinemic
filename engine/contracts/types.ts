// CONTRACTS-V2. Shared types for every module. Do not change these without
// bumping the version and updating docs/BUILD_PLAN.md.

export const CONTRACTS_VERSION = "contracts-v3";

// ---------- Stack and languages ----------

export type LanguageId = "typescript" | "javascript" | "python" | "go";

export interface StackInfo {
  languages: LanguageId[];
  primaryLanguage: LanguageId | null;
  framework: string | null; // e.g. "nextjs", "django", "gin"; null if unknown
  manifests: string[];      // relative manifest paths found, e.g. ["package.json"]
  confidence: "high" | "medium" | "low";
}

// Every language adapter implements this. One adapter per language.
export interface LanguageAdapter {
  id: LanguageId;
  detect(projectPath: string): StackInfo | null;      // null if this language does not apply
  extract(projectPath: string): SymbolGraph;
  checks(projectPath: string): CheckCommand[];
}

// ---------- Symbol graph ----------

export type SymbolKind = "function" | "class" | "type" | "variable" | "import" | "export";

export interface SymbolNode {
  id: string;          // stable: `${filePath}#${name}`
  name: string;
  kind: SymbolKind;
  filePath: string;    // relative to project root, forward slashes
  startLine: number;
  endLine: number;
  signature?: string;
}

export type EdgeKind = "imports" | "calls" | "references" | "exports";

export interface SymbolEdge {
  from: string;        // SymbolNode.id
  to: string;          // SymbolNode.id, or the unresolved target name
  kind: EdgeKind;
  resolved: boolean;   // false when the target is only a name (syntax-only languages)
}

export interface SymbolGraph {
  language: LanguageId;
  nodes: SymbolNode[];
  edges: SymbolEdge[];
  coverage: {
    filesParsed: number;
    filesSkipped: number;
    skippedReasons: string[];
  };
}

// ---------- Context selection and packing ----------

export interface Selection {
  taskTargets: string[];                 // file paths or symbol ids given for the task
  symbols: SymbolNode[];                 // directly related symbols, ranked
  callers: SymbolNode[];                 // symbols that call or import the targets
  reasons: Record<string, string>;       // symbol id -> why it was selected
  dropped: string[];                     // symbol ids cut by maxSymbols
}

export interface ContextPack {
  text: string;                          // the compiled prompt section
  tokenEstimate: number;
  budget: number;
  included: string[];                    // symbol ids included
  dropped: { id: string; reason: string }[];
  doNotRePropose: string[];              // rejected options with reasons
}

// ---------- Ledger ----------

export type ReqStatus = "proposed" | "accepted" | "implemented" | "verified";

export interface Requirement {
  id: string;                            // REQ-001
  text: string;
  status: ReqStatus;
  acceptanceTests: string[];
}

export interface Decision {
  id: string;                            // DEC-001
  chosen: string;
  rejected: string[];
  reason: string;
  requirementIds: string[];
  createdAt: string;                     // ISO 8601
}

export interface Constraint {
  id: string;                            // CON-001
  text: string;
}

export interface LedgerEvent {
  id: string;
  at: string;                            // ISO 8601
  actor: "user" | "verifier" | "model" | "system";
  type: string;
  payload: unknown;
}

export interface Ledger {
  projectId: string;
  requirements: Requirement[];
  decisions: Decision[];
  constraints: Constraint[];
  events: LedgerEvent[];
}

// ---------- Model calls ----------

export interface ProviderConfig {
  provider: string;                      // e.g. "openrouter", "groq"
  baseUrl: string;                       // OpenAI-compatible base URL
  apiKeyEnv: string;                     // NAME of the env var holding the key, never the key itself
  modelId: string;
}

export interface FilePatch {
  path: string;                          // relative path
  newContent: string;                    // full new file content (simple and easy to verify)
}

export interface ModelResult {
  ok: boolean;
  provider: string | null;
  modelId: string | null;
  patches?: FilePatch[];
  tokensUsed?: number;                   // v3: total tokens from the provider's usage object, if present
  error?: { kind: "quota" | "network" | "invalid_output" | "other"; message: string };
}

// ---------- Usage limits (v3) ----------

export interface UsageLimits {
  perUserDailyRequests: number;          // per user, per model, per UTC day
  perUserDailyTokens: number;            // per user, per model, per UTC day
  globalDailyRequests: number;           // all users, per model, per UTC day
}

// ---------- Verification ----------

export interface CheckCommand {
  name: "typecheck" | "test" | "build" | "secret-scan";
  command: string[];                     // argv array, never a shell string
  cwd: string;
  timeoutMs: number;
}

export interface CheckResult {
  name: string;
  passed: boolean;
  skipped: boolean;
  skipReason?: string;
  durationMs: number;
  output: string;                        // truncated to 4000 characters
}

export interface VerifyResult {
  passed: boolean;                       // true only if every non-skipped check passed
  checks: CheckResult[];
  commitRef?: string;
}