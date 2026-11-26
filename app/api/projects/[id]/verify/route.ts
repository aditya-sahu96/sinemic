import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import type { CheckCommand } from "@/engine/contracts/types";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data", "projects");
const TMP_PROJECTS_ROOT = "/tmp/sinemic/projects";
const LEDGER_DIR = path.join(process.cwd(), "data", "ledger");
const WORK_DIR = path.join(process.cwd(), "data", "work");

interface VerifyRequest {
  patches: { path: string; newContent: string }[];
}

type ProjectSource = "imported" | "sample" | "demo";

function resolveProjectPath(id: string): string | null {
  const dataPath = path.join(DATA_DIR, id);
  if (fs.existsSync(dataPath)) return dataPath;
  const tmpPath = path.join(TMP_PROJECTS_ROOT, id);
  if (fs.existsSync(tmpPath)) return tmpPath;
  return null;
}

function readSource(projectPath: string): ProjectSource {
  try {
    const metaPath = path.join(projectPath, ".sinemic-meta.json");
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
      if (meta.source === "imported" || meta.source === "sample" || meta.source === "demo") {
        return meta.source;
      }
    }
  } catch {}
  return "sample";
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectPath = resolveProjectPath(id);

  if (!projectPath) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const source = readSource(projectPath);
  const dbPath = path.join(LEDGER_DIR, `${id}.db`);

  try {
    fs.mkdirSync(LEDGER_DIR, { recursive: true });
    fs.mkdirSync(WORK_DIR, { recursive: true });

    const body: VerifyRequest = await req.json();
    const { patches = [] } = body;

    const { detectStack } = await import("@/engine/modules/stack");
    const { getAdapter } = await import("@/engine/modules/adapters");
    const { applyPatches, verify, secretScan, parseCheck } = await import("@/engine/modules/verifier");
    const { openLedger } = await import("@/engine/modules/ledger");

    const stack = detectStack(projectPath);
    const primaryLanguage = stack.primaryLanguage;

    if (!primaryLanguage) {
      return NextResponse.json({ error: "Could not detect project language" }, { status: 400 });
    }

    const adapter = getAdapter(primaryLanguage);
    const allAdapterChecks = adapter.checks(projectPath);

    // For imported projects, run only non-executing checks (secret-scan, parse).
    // typecheck and test are skipped. For sample/demo, run all adapter checks.
    let adapterCheckCommands: CheckCommand[] = [];
    if (source === "imported") {
      adapterCheckCommands = [];
    } else {
      adapterCheckCommands = allAdapterChecks.map((c) => ({
        ...c,
        cwd: path.join(WORK_DIR, id),
      }));
    }

    // Separate parse from other adapter checks — parse is handled in-process.
    const parseCommand = adapterCheckCommands.find((c) => c.name === "parse");
    const otherCommands = adapterCheckCommands.filter((c) => c.name !== "parse");

    const workDir = applyPatches(projectPath, patches, path.join(WORK_DIR, id));

    const verifyResult = await verify(workDir, otherCommands);
    const secretResult = secretScan(workDir);

    // Run parse check in-process on the work dir.
    const parseResult = parseCommand ? parseCheck(workDir) : {
      name: "parse",
      passed: true,
      skipped: true,
      skipReason: "No parse check available for this stack",
      durationMs: 0,
      output: "skipped",
    };

    const allChecks = [...verifyResult.checks, secretResult, parseResult];
    const passed = allChecks.every((c) => !c.skipped && c.passed);

    const ledgerStore = openLedger(dbPath, id);
    ledgerStore.appendEvent("system", "verify.completed", { passed, checks: allChecks, patches, source });
    ledgerStore.close();

    return NextResponse.json({ passed, checks: allChecks, source });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Verify failed" }, { status: 500 });
  }
}
