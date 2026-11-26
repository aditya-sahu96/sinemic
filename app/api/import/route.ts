import { NextResponse } from "next/server";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const PROJECTS_ROOT = "/tmp/sinemic/projects";
const DATA_DIR = path.join(process.cwd(), "data", "projects");

export async function POST(req: Request) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Enter a GitHub repository link." }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url) {
    return NextResponse.json({ error: "Enter a GitHub repository link." }, { status: 400 });
  }

  const { parseGitHubUrl } = await import("@/lib/githubUrl");
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    return NextResponse.json({ error: "Enter a GitHub repository link." }, { status: 400 });
  }

  const id = crypto.randomUUID().slice(0, 8);
  const projectPath = path.join(PROJECTS_ROOT, id);

  try {
    const { ensureProject } = await import("@/lib/ensureProject");
    await ensureProject(id, url);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Import failed." }, { status: 500 });
  }

  // Persist project under data/projects so verify/approve can find it,
  // and mark it as an imported (non-executing checks) project.
  try {
    const dataProjectPath = path.join(DATA_DIR, id);
    if (fs.existsSync(dataProjectPath)) {
      fs.rmSync(dataProjectPath, { recursive: true, force: true });
    }
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.cpSync(projectPath, dataProjectPath, { recursive: true });
    fs.writeFileSync(
      path.join(dataProjectPath, ".sinemic-meta.json"),
      JSON.stringify({ source: "imported" }),
      "utf8",
    );
  } catch {
    return NextResponse.json({ error: "Failed to persist imported project" }, { status: 500 });
  }

  try {
    const { detectStack } = await import("@/engine/modules/stack");
    const { getAdapter } = await import("@/engine/modules/adapters");

    const stack = detectStack(projectPath);
    const primaryLanguage = stack.primaryLanguage;

    if (!primaryLanguage) {
      return NextResponse.json({ error: "Could not detect project language" }, { status: 400 });
    }

    const adapter = getAdapter(primaryLanguage);
    const graph = adapter.extract(projectPath);

    const name = parsed.repo.replace(/\.git$/, "");

    return NextResponse.json({
      id,
      name,
      stack,
      symbols: graph,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEED_MODULE")) {
      return NextResponse.json({ error: "NEED_MODULE" }, { status: 501 });
    }
    console.error("Extraction error:", error);
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
