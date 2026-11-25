import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import type { CheckCommand, CheckResult, VerifyResult, FilePatch } from "../../contracts/types";

export function applyPatches(projectPath: string, patches: FilePatch[], workDir: string): string {
  if (fs.existsSync(workDir)) fs.rmSync(workDir, { recursive: true, force: true });
  fs.mkdirSync(workDir, { recursive: true });
  fs.cpSync(projectPath, workDir, { recursive: true });
  for (const p of patches) {
    const full = path.join(workDir, p.path);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, p.newContent, "utf8");
  }
  return workDir;
}

export async function verify(projectPath: string, checks: CheckCommand[]): Promise<VerifyResult> {
  const results: CheckResult[] = [];
  let passed = true;
  for (const c of checks) {
    const start = Date.now();
    let skipped = false;
    let skipReason: string | undefined;
    let output = "";
    let ok = true;
    try {
      const r = spawnSync(c.command[0], c.command.slice(1), { cwd: c.cwd || projectPath, timeout: c.timeoutMs, encoding: "utf8", shell: false });
      output = ((r.stdout ?? "") + (r.stderr ?? "")).slice(0, 4000);
      if (r.status !== 0) ok = false;
      if (r.error) { ok = false; output = String(r.error).slice(0, 4000); }
    } catch (e) {
      ok = false; output = String(e).slice(0, 4000);
    }
    const durationMs = Date.now() - start;
    const cr: CheckResult = { name: c.name, passed: ok, skipped, skipReason, durationMs, output };
    results.push(cr);
    if (!skipped && !ok) passed = false;
  }
  return { passed, checks: results };
}

export function secretScan(projectPath: string): CheckResult {
  const start = Date.now();
  const secretPatterns = [
    /AKIA[0-9A-Z]{16}/,
    /sk-[A-Za-z0-9]{20,}/,
    /ghp_[A-Za-z0-9]{36}/,
  ];
  let found = false;
  const files: string[] = [];
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".git") continue;
        walk(full);
      } else {
        try {
          const content = fs.readFileSync(full, "utf8");
          for (const pat of secretPatterns) {
            if (pat.test(content)) { found = true; files.push(full); break; }
          }
        } catch {}
      }
    }
  }
  try { walk(projectPath); } catch {}
  const durationMs = Date.now() - start;
  return {
    name: "secret-scan",
    passed: !found,
    skipped: false,
    durationMs,
    output: found ? `secrets found in: ${files.join(", ")}`.slice(0, 4000) : "no secrets found",
  };
}
