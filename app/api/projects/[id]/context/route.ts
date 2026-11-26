import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data", "projects");
const LEDGER_DIR = path.join(process.cwd(), "data", "ledger");

interface ContextRequest {
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

  if (!fs.existsSync(projectPath)) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    fs.mkdirSync(LEDGER_DIR, { recursive: true });

    const body: ContextRequest = await req.json();
    const { targetFiles } = body;

    const { detectStack } = await import("@/engine/modules/stack");
    const { getAdapter } = await import("@/engine/modules/adapters");
    const { selectContext } = await import("@/engine/modules/selector");
    const { compilePack } = await import("@/engine/modules/context");
    const { openLedger } = await import("@/engine/modules/ledger");

    const stack = detectStack(projectPath);
    const primaryLanguage = stack.primaryLanguage;

    if (!primaryLanguage) {
      return NextResponse.json({ error: "Could not detect project language" }, { status: 400 });
    }

    const adapter = getAdapter(primaryLanguage);
    const graph = adapter.extract(projectPath);

    const selection = selectContext(graph, targetFiles);
    const store = openLedger(dbPath, id);
    const ledger = store.read();
    store.close();

    const pack = compilePack(ledger, selection, graph, 6000);

    return NextResponse.json({ pack, selection });
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEED_MODULE")) {
      return NextResponse.json({ error: "NEED_MODULE" }, { status: 501 });
    }
    console.error("Context error:", error);
    return NextResponse.json({ error: "Context pack failed" }, { status: 500 });
  }
}
