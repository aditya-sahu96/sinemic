import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data", "projects");
const LEDGER_DIR = path.join(process.cwd(), "data", "ledger");

interface ApproveRequest {
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

    const body: ApproveRequest = await req.json();
    const { patches = [] } = body;

    const { openLedger } = await import("@/engine/modules/ledger");

    const store = openLedger(dbPath, id);
    const ledger = store.read();

    // Find the latest verify.completed event
    const verifyEvents = ledger.events.filter((e) => e.type === "verify.completed");
    if (verifyEvents.length === 0) {
      store.close();
      return NextResponse.json({ error: "No verify event found. Run verify first." }, { status: 400 });
    }

    const latestVerify = verifyEvents[verifyEvents.length - 1] as { payload: { passed: boolean; patches: { path: string; newContent: string }[] } };
    if (!latestVerify.payload.passed) {
      store.close();
      return NextResponse.json({ error: "Latest verify did not pass" }, { status: 400 });
    }

    // Check patches match exactly
    const storedPatches = latestVerify.payload.patches ?? [];
    if (storedPatches.length !== patches.length) {
      store.close();
      return NextResponse.json({ error: "Patch set does not match verified patches" }, { status: 400 });
    }

    for (let i = 0; i < patches.length; i++) {
      if (patches[i].path !== storedPatches[i].path || patches[i].newContent !== storedPatches[i].newContent) {
        store.close();
        return NextResponse.json({ error: "Patch set does not match verified patches" }, { status: 400 });
      }
    }

    // Write patches directly to project files
    for (const p of patches) {
      const full = path.join(projectPath, p.path);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, p.newContent, "utf8");
    }

    // Advance requirement status: accepted -> implemented (system) -> verified (verifier)
    const acceptedReqs = ledger.requirements.filter((r) => r.status === "accepted");
    let requirementId: string | null = null;

    for (const req of acceptedReqs) {
      const implemented = store.setRequirementStatus(req.id, "implemented", "system");
      requirementId = implemented.id;
      const verified = store.setRequirementStatus(req.id, "verified", "verifier");
      requirementId = verified.id;
    }

    store.close();

    return NextResponse.json({ ok: true, requirementId, status: "verified" });
  } catch (error) {
    console.error("Approve error:", error);
    if (error instanceof Error && error.message.includes("invalid transition")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Approve failed" }, { status: 500 });
  }
}
