import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data", "projects");
const LEDGER_DIR = path.join(process.cwd(), "data", "ledger");
const USAGE_DIR = path.join(process.cwd(), "data", "usage");
const MODELS_PATH = path.join(process.cwd(), "engine", "config", "models.json");

const DEFAULT_USER_ID = "default";

interface ModelEntry {
  modelId: string;
  chat: boolean;
  priority: number;
  perUserDailyRequests: number;
  perUserDailyTokens: number;
  globalDailyRequests: number;
  status: string;
  notes?: string;
}

interface ModelsConfig {
  provider: string;
  baseUrl: string;
  apiKeyEnv: string;
  models: ModelEntry[];
}

interface RunRequest {
  task: string;
  targetFiles: string[];
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectPath = path.join(DATA_DIR, id);
  const dbPath = path.join(LEDGER_DIR, `${id}.db`);
  const usageDbPath = path.join(USAGE_DIR, `${id}.db`);

  if (!fs.existsSync(projectPath)) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    fs.mkdirSync(LEDGER_DIR, { recursive: true });
    fs.mkdirSync(USAGE_DIR, { recursive: true });

    const body: RunRequest = await req.json();
    const { task, targetFiles = [] } = body;

    if (!task || !task.trim()) {
      return NextResponse.json({ error: "Task is required" }, { status: 400 });
    }

    const modelsConfig: ModelsConfig = JSON.parse(fs.readFileSync(MODELS_PATH, "utf8"));

    // Build context pack (same pipeline as /context)
    const { detectStack } = await import("@/engine/modules/stack");
    const { getAdapter } = await import("@/engine/modules/adapters");
    const { selectContext } = await import("@/engine/modules/selector");
    const { compilePack } = await import("@/engine/modules/context");
    const { openLedger } = await import("@/engine/modules/ledger");
    const { openUsageStore } = await import("@/engine/modules/usage");

    const stack = detectStack(projectPath);
    const primaryLanguage = stack.primaryLanguage;

    if (!primaryLanguage) {
      return NextResponse.json({ error: "Could not detect project language" }, { status: 400 });
    }

    const adapter = getAdapter(primaryLanguage);
    const graph = adapter.extract(projectPath);

    const selection = selectContext(graph, targetFiles);
    const ledgerStore = openLedger(dbPath, id);
    const ledger = ledgerStore.read();
    ledgerStore.close();

    const pack = compilePack(ledger, selection, graph, 6000);

    // Filter models: only chat models with status ok or untested, sorted by priority
    const candidateModels = modelsConfig.models
      .filter((m: ModelEntry) => m.chat && (m.status === "ok" || m.status === "untested"))
      .sort((a: ModelEntry, b: ModelEntry) => (a.priority ?? 999) - (b.priority ?? 999));

    // Open usage store and remove models where user or global cap is reached
    const usageStore = openUsageStore(usageDbPath);
    const now = new Date();

    const availableModels = candidateModels.filter((m: ModelEntry) =>
      usageStore.canUse(DEFAULT_USER_ID, m.modelId, {
        perUserDailyRequests: m.perUserDailyRequests,
        perUserDailyTokens: m.perUserDailyTokens,
        globalDailyRequests: m.globalDailyRequests,
      }, now)
    );

    if (availableModels.length === 0) {
      usageStore.close();
      return NextResponse.json({
        error: "Free daily limit reached for today. Try again tomorrow, or add your own OpenRouter key.",
        requestsLeft: 0,
        requestsLimit: 0,
      });
    }

    const providers = availableModels.map((m: ModelEntry) => ({
      provider: modelsConfig.provider,
      baseUrl: modelsConfig.baseUrl,
      apiKeyEnv: modelsConfig.apiKeyEnv,
      modelId: m.modelId,
    }));

    const { complete } = await import("@/engine/modules/model");
    const result = await complete(pack, task, providers);

    let requestsLeft = 0;
    let requestsLimit = 0;
    let answeredModel: string | null = null;

    if (result.ok && result.modelId) {
      usageStore.record(DEFAULT_USER_ID, result.modelId, result.tokensUsed ?? 0, now);
      const used = usageStore.today(DEFAULT_USER_ID, result.modelId, now);
      const model = availableModels.find((m: ModelEntry) => m.modelId === result.modelId);
      requestsLimit = model?.perUserDailyRequests ?? 0;
      requestsLeft = Math.max(0, requestsLimit - used.requests);
      answeredModel = result.modelId;
    }

    usageStore.close();

    return NextResponse.json({
      patches: result.patches ?? [],
      model: answeredModel,
      error: result.error ?? null,
      requestsLeft,
      requestsLimit,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEED_MODULE")) {
      return NextResponse.json({ error: "NEED_MODULE" }, { status: 501 });
    }
    console.error("Run error:", error);
    return NextResponse.json({ error: "Run failed" }, { status: 500 });
  }
}
