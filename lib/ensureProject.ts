import fs from "node:fs";
import path from "node:path";

const PROJECTS_ROOT = "/tmp/sinemic/projects";

export interface SavedProject {
  id: string;
  url: string;
}

const savedProjects = new Map<string, SavedProject>();

export function registerProject(id: string, url: string): void {
  savedProjects.set(id, { id, url });
}

export function getSavedUrl(id: string): string | undefined {
  return savedProjects.get(id)?.url;
}

export function projectPath(id: string): string {
  return path.join(PROJECTS_ROOT, id);
}

export async function ensureProject(id: string, url: string): Promise<string> {
  const p = projectPath(id);
  if (fs.existsSync(p)) return p;

  const savedUrl = getSavedUrl(id) ?? url;
  registerProject(id, savedUrl);

  return downloadAndExtract(savedUrl, p);
}

async function downloadAndExtract(url: string, destDir: string): Promise<string> {
  const { parseGitHubUrl } = await import("./githubUrl");
  const { safeUnzip } = await import("./safeUnzip");

  const parsed = parseGitHubUrl(url);
  if (!parsed) throw new Error("Invalid GitHub URL");

  const { owner, repo } = parsed;

  const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (metaRes.status === 404) {
    throw new Error("Repository not found or it is private.");
  }
  if (metaRes.status === 403) {
    throw new Error("GitHub is busy right now. Try again in a few minutes.");
  }
  if (!metaRes.ok) {
    throw new Error("Failed to fetch repository info from GitHub.");
  }

  const meta = await metaRes.json();
  const branch = meta.default_branch ?? "main";

  const zipRes = await fetch(`https://codeload.github.com/${owner}/${repo}/zip/refs/heads/${branch}`);

  if (!zipRes.ok) {
    throw new Error("Failed to download repository.");
  }

  const contentLength = zipRes.headers.get("content-length");
  if (contentLength && Number(contentLength) > 5 * 1024 * 1024) {
    throw new Error("Repository is too large.");
  }

  const chunks: Buffer[] = [];
  let total = 0;
  const reader = zipRes.body?.getReader();
  if (!reader) throw new Error("No response body.");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const buf = Buffer.from(value);
    total += buf.length;
    if (total > 5 * 1024 * 1024) {
      throw new Error("Repository is too large.");
    }
    chunks.push(buf);
  }

  const zipBuffer = Buffer.concat(chunks);
  await safeUnzip(zipBuffer, destDir);
  return destDir;
}
