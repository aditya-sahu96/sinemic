import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import JSZip from "jszip";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data", "projects");
const LEDGER_DIR = path.join(process.cwd(), "data", "ledger");

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", ".turbo", "dist", "build"]);
const SKIP_FILES = new Set([".DS_Store", "Thumbs.db"]);

function shouldSkip(relPath: string): boolean {
  const parts = relPath.split(path.sep);
  if (parts.some((p) => SKIP_DIRS.has(p))) return true;
  const name = parts[parts.length - 1];
  if (SKIP_FILES.has(name)) return true;
  return false;
}

async function addDirToZip(zip: JSZip, dirPath: string, zipPath: string): Promise<void> {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const entryZipPath = zipPath ? path.posix.join(zipPath, entry.name) : entry.name;
    if (shouldSkip(entryZipPath)) continue;
    if (entry.isDirectory()) {
      await addDirToZip(zip, fullPath, entryZipPath);
    } else {
      const content = fs.readFileSync(fullPath);
      zip.file(entryZipPath, content);
    }
  }
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

  let approved = false;
  if (fs.existsSync(dbPath)) {
    try {
      const { openLedger } = await import("@/engine/modules/ledger");
      const store = openLedger(dbPath, id);
      const ledger = store.read();
      approved = ledger.requirements.some((r) => r.status === "verified");
      store.close();
    } catch {
      approved = false;
    }
  }
  if (!approved) {
    return NextResponse.json({ error: "Project not yet approved" }, { status: 403 });
  }

  const zip = new JSZip();
  await addDirToZip(zip, projectPath, "");

  const metaName = id.replace(/[^a-zA-Z0-9_-]/g, "_");
  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="sinemic-${metaName}.zip"`,
      "Content-Length": String(buffer.length),
    },
  });
}
