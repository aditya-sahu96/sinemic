import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import type { LedgerStore } from "@/engine/contracts";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data", "projects");
const LEDGER_DIR = path.join(process.cwd(), "data", "ledger");

function seedLedger(store: LedgerStore) {
  store.addRequirement("Discount above 1000", [
    "total > 1000 applies discount",
    "discount capped at 50%",
  ]);
  store.addRequirement("Total includes tax", [
    "subtotal + tax = total",
    "tax rate configurable",
  ]);
  store.addDecision({
    chosen: "percentage discount",
    rejected: ["fixed amount discount", "tiered discount"],
    reason:
      "Percentage scales with order value and is easier to explain to customers",
    requirementIds: ["REQ-001"],
  });
}

export async function GET(
  _req: Request,
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
    const { openLedger } = await import("@/engine/modules/ledger");

    const store = openLedger(dbPath, id);
    const ledger = store.read();

    if (ledger.requirements.length === 0) {
      seedLedger(store);
      store.close();
      return NextResponse.json({ ledger: store.read() });
    }

    store.close();
    return NextResponse.json({ ledger });
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEED_MODULE")) {
      return NextResponse.json({ error: "NEED_MODULE" }, { status: 501 });
    }
    console.error("Ledger error:", error);
    return NextResponse.json({ error: "Ledger read failed" }, { status: 500 });
  }
}
