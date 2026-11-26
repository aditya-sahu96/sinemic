import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const LEDGER_DIR = path.join(process.cwd(), "data", "ledger");
const DATA_DIR = path.join(process.cwd(), "data", "projects");

interface FilePatch {
  path: string;
  newContent: string;
  oldContent?: string;
}

function diffLines(oldContent: string, newContent: string): { type: "add" | "remove" | "same"; content: string }[] {
  const oldLines = oldContent.split("\n");
  const newLines = newContent.split("\n");
  const result: { type: "add" | "remove" | "same"; content: string }[] = [];
  const maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];
    if (oldLine === undefined) {
      result.push({ type: "add", content: newLine });
    } else if (newLine === undefined) {
      result.push({ type: "remove", content: oldLine });
    } else if (oldLine === newLine) {
      result.push({ type: "same", content: oldLine });
    } else {
      result.push({ type: "remove", content: oldLine });
      result.push({ type: "add", content: newLine });
    }
  }
  return result;
}

function unifiedDiff(filePath: string, oldContent: string, newContent: string): string {
  const lines = diffLines(oldContent, newContent);
  const out: string[] = [];
  out.push(`diff --git a/${filePath} b/${filePath}`);
  out.push(`--- a/${filePath}`);
  out.push(`+++ b/${filePath}`);

  let oldStart = 1;
  let newStart = 1;
  let oldCount = 0;
  let newCount = 0;
  const hunkLines: string[] = [];

  function flushHunk() {
    if (hunkLines.length === 0) return;
    out.push(`@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`);
    out.push(...hunkLines);
    hunkLines.length = 0;
    oldCount = 0;
    newCount = 0;
  }

  for (const line of lines) {
    if (line.type === "same") {
      if (hunkLines.length > 0) {
        hunkLines.push(`  ${line.content}`);
        oldCount++;
        newCount++;
      }
    } else {
      if (hunkLines.length === 0) {
        oldStart = 1;
        newStart = 1;
      }
      if (line.type === "remove") {
        hunkLines.push(`- ${line.content}`);
        oldCount++;
      } else {
        hunkLines.push(`+ ${line.content}`);
        newCount++;
      }
    }
  }
  flushHunk();

  if (out.length <= 3) return "";
  return out.join("\n");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dbPath = path.join(LEDGER_DIR, `${id}.db`);
  const projectPath = path.join(DATA_DIR, id);

  if (!fs.existsSync(dbPath)) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const { openLedger } = await import("@/engine/modules/ledger");
    const store = openLedger(dbPath, id);
    const ledger = store.read();

    const verifyEvents = ledger.events.filter((e) => e.type === "verify.completed");
    if (verifyEvents.length === 0) {
      store.close();
      return NextResponse.json({ error: "No verify event found" }, { status: 404 });
    }

    const latestVerify = verifyEvents[verifyEvents.length - 1] as {
      payload: { patches: FilePatch[] };
    };
    const patches = latestVerify.payload.patches ?? [];
    store.close();

    if (patches.length === 0) {
      return new NextResponse("", { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    const diffParts: string[] = [];
    for (const p of patches) {
      const oldContent = p.oldContent ?? "";
      const diff = unifiedDiff(p.path, oldContent, p.newContent);
      if (diff) diffParts.push(diff);
    }

    const result = diffParts.join("\n\n") + "\n";
    return new NextResponse(result, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch {
    return NextResponse.json({ error: "Diff generation failed" }, { status: 500 });
  }
}
