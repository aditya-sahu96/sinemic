import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data", "projects");
const LEDGER_DIR = path.join(process.cwd(), "data", "ledger");
const WORK_DIR = path.join(process.cwd(), "data", "work");

interface VerifyRequest {
  patches: { path: string; newContent: string }[];
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
    fs.mkdirSync(WORK_DIR, { recursive: true });

    const body: VerifyRequest = await req.json();
    const { patches = [] } = body;

    const { detectStack } = await import("@/engine/modules/stack");
    const { getAdapter } = await import("@/engine/modules/adapters");
    const { applyPatches, verify, secretScan } = await import("@/engine/modules/verifier");
    const { openLedger } = await import("@/engine/modules/ledger");

    const stack = detectStack(projectPath);
    const primaryLanguage = stack.primaryLanguage;

    if (!primaryLanguage) {
      return NextResponse.json({ error: "Could not detect project language" }, { status: 400 });
    }

    const adapter = getAdapter(primaryLanguage);
    const checks = adapter.checks(projectPath).map((c) => ({
      ...c,
      cwd: path.join(WORK_DIR, id),
    }));

    const workDir = applyPatches(projectPath, patches, path.join(WORK_DIR, id));

    const verifyResult = await verify(workDir, checks);
    const secretResult = secretScan(workDir);

    const allChecks = [...verifyResult.checks, secretResult];
    const passed = allChecks.every((c) => !c.skipped && c.passed);

    const ledgerStore = openLedger(dbPath, id);
    ledgerStore.appendEvent("system", "verify.completed", { passed, checks: allChecks, patches });
    ledgerStore.close();

    return NextResponse.json({ passed, checks: allChecks });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Verify failed" }, { status: 500 });
  }
}
