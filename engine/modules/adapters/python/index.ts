import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import type { LanguageAdapter, StackInfo, SymbolGraph, SymbolNode, SymbolEdge, CheckCommand, LanguageId } from "../../../contracts/types";
import { detectStack } from "../../stack";

const scriptPath = path.join(__dirname, "extract_symbols.py");

function runPython(projectPath: string): any {
  const candidates = process.platform === "win32" ? ["python", "python3"] : ["python3", "python"];
  let lastErr: any = null;
  for (const bin of candidates) {
    try {
      const out = execFileSync(bin, [scriptPath, projectPath], { encoding: "utf8", timeout: 60000 });
      return JSON.parse(out);
    } catch (e: any) {
      lastErr = e;
      if (e && e.code === "ENOENT") continue;
      // if command exists but failed, still try next
      continue;
    }
  }
  throw lastErr ?? new Error("python not found");
}

export const pythonAdapter: LanguageAdapter = {
  id: "python",
  detect(projectPath: string): StackInfo | null {
    const has = fs.existsSync(path.join(projectPath, "pyproject.toml")) ||
      fs.existsSync(path.join(projectPath, "requirements.txt")) ||
      fs.existsSync(path.join(projectPath, "setup.py"));
    if (!has) return null;
    return detectStack(projectPath);
  },
  extract(projectPath: string): SymbolGraph {
    const raw = runPython(projectPath);
    const nodes: SymbolNode[] = (raw.nodes || []).map((n: any) => ({
      id: n.id,
      name: n.name,
      kind: n.kind,
      filePath: n.filePath,
      startLine: n.startLine,
      endLine: n.endLine,
      signature: n.signature,
    }));
    const edges: SymbolEdge[] = (raw.edges || []).map((e: any) => ({
      from: e.from,
      to: e.to,
      kind: e.kind,
      resolved: !!e.resolved,
    }));
    return {
      language: "python",
      nodes,
      edges,
      coverage: {
        filesParsed: raw.coverage?.filesParsed ?? 0,
        filesSkipped: raw.coverage?.filesSkipped ?? 0,
        skippedReasons: raw.coverage?.skippedReasons ?? [],
      },
    };
  },
  checks(projectPath: string): CheckCommand[] {
    return [
      { name: "test", command: ["python", "-m", "pytest"], cwd: projectPath, timeoutMs: 120000 },
      { name: "typecheck", command: ["python", "-m", "mypy", "."], cwd: projectPath, timeoutMs: 120000 },
    ];
  },
};

export function buildGraph(language: LanguageId, graph: Omit<SymbolGraph, "language">): SymbolGraph {
  return { language, ...graph };
}

export default pythonAdapter;
export { pythonAdapter as adapter };
