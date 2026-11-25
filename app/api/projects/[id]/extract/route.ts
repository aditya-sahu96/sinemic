import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data", "projects");

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectPath = path.join(DATA_DIR, id);

  if (!fs.existsSync(projectPath)) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const { detectStack } = await import("@/engine/modules/stack/index.ts");
    const { getAdapter } = await import("@/engine/modules/adapters/index.ts");

    const stack = detectStack(projectPath);
    const primaryLanguage = stack.primaryLanguage;

    if (!primaryLanguage) {
      return NextResponse.json({ error: "Could not detect project language" }, { status: 400 });
    }

    const adapter = getAdapter(primaryLanguage);
    const graph = adapter.extract(projectPath);

    return NextResponse.json({ graph });
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEED_MODULE")) {
      return NextResponse.json({ error: "NEED_MODULE" }, { status: 501 });
    }
    console.error("Extraction error:", error);
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}