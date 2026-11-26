import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const runtime = "nodejs";

const SAMPLE_REPO = path.join(process.cwd(), "engine", "sample-repos", "ts-checkout");
const DATA_DIR = path.join(process.cwd(), "data", "projects");

function copyRecursive(src: string, dest: string) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

export async function POST() {
  const id = crypto.randomUUID().slice(0, 8);
  const projectPath = path.join(DATA_DIR, id);

  if (fs.existsSync(projectPath)) {
    return NextResponse.json({ error: "Project already exists" }, { status: 409 });
  }

  try {
    copyRecursive(SAMPLE_REPO, projectPath);
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "Failed to create demo project" }, { status: 500 });
  }
}