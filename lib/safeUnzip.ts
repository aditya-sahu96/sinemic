import JSZip from "jszip";
import fs from "node:fs";
import path from "node:path";

const MAX_FILES = 2000;
const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

function isUnsafeEntry(name: string): boolean {
  if (name.includes("..")) return true;
  if (name.startsWith("/")) return true;
  if (/^[a-zA-Z]:[\\/]/.test(name)) return true;
  return false;
}

function isSkippedDir(entryPath: string): boolean {
  const parts = entryPath.split(/[\\/]/);
  for (const part of parts) {
    if (part === "node_modules" || part === ".git") return true;
  }
  return false;
}

export interface UnzipResult {
  fileCount: number;
  baseDir: string;
}

interface ZipEntry {
  name: string;
  dir: boolean;
  size: number;
  async: (type: string) => Promise<Buffer>;
}

export async function safeUnzip(zipBuffer: Buffer, destDir: string): Promise<UnzipResult> {
  const zip = await JSZip.loadAsync(zipBuffer);

  const entries = Object.values(zip.files);
  let fileCount = 0;

  for (const entry of entries) {
    if (fileCount >= MAX_FILES) {
      throw new Error("Repository contains too many files");
    }

    const name = entry.name;

    if (isUnsafeEntry(name)) continue;
    if (isSkippedDir(name)) continue;

    if (entry.dir) continue;

    if ((entry as unknown as ZipEntry).size > MAX_FILE_SIZE) continue;

    fileCount++;
  }

  if (fileCount === 0) {
    throw new Error("No files found in repository");
  }

  // Determine the top-level folder GitHub adds (e.g. sinemic-test-repo-main/)
  // and strip it so files are written directly into destDir.
  let topLevel: string | null = null;
  for (const entry of entries) {
    if (entry.dir) continue;
    const firstPart = entry.name.split(/[\\/]/)[0];
    if (firstPart && firstPart !== entry.name) {
      topLevel = firstPart;
      break;
    }
  }

  const stripPrefix = topLevel ? topLevel + "/" : "";

  fs.mkdirSync(destDir, { recursive: true });

  fileCount = 0;
  for (const entry of entries) {
    if (fileCount >= MAX_FILES) break;

    const name = entry.name;
    if (isUnsafeEntry(name)) continue;
    if (isSkippedDir(name)) continue;
    if (entry.dir) continue;
    if ((entry as unknown as ZipEntry).size > MAX_FILE_SIZE) continue;

    const relative = stripPrefix ? name.startsWith(stripPrefix) ? name.slice(stripPrefix.length) : name : name;
    if (!relative || relative === "") continue;

    const outPath = path.join(destDir, relative);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    const content = await entry.async("nodebuffer");
    fs.writeFileSync(outPath, content);

    fileCount++;
  }

  return { fileCount, baseDir: destDir };
}
