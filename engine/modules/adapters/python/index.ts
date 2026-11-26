import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import type { LanguageAdapter, StackInfo, SymbolGraph, SymbolNode, SymbolEdge, SymbolKind, EdgeKind, CheckCommand, LanguageId } from "../../../contracts/types";
import { detectStack } from "../../stack";

const scriptPath = path.join(__dirname, "extract_symbols.py");

interface PythonRaw {
  nodes: Array<{ id: string; name: string; kind: string; filePath: string; startLine: number; endLine: number; signature?: string }>;
  edges: Array<{ from: string; to: string; kind: string; resolved: boolean }>;
  coverage?: { filesParsed?: number; filesSkipped?: number; skippedReasons?: string[] };
}

function runPython(projectPath: string): PythonRaw {
  const candidates = process.platform === "win32" ? ["python", "python3"] : ["python3", "python"];
  let lastErr: Error | null = null;
  for (const bin of candidates) {
    try {
      const out = execFileSync(bin, [scriptPath, projectPath], { encoding: "utf8", timeout: 60000 });
      return JSON.parse(out);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      if (lastErr && lastErr.message.includes("ENOENT")) continue;
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
    const nodes: SymbolNode[] = (raw.nodes || []).map((n) => ({
      id: n.id,
      name: n.name,
      kind: n.kind as SymbolKind,
      filePath: n.filePath,
      startLine: n.startLine,
      endLine: n.endLine,
      signature: n.signature,
    }));
    const edges: SymbolEdge[] = (raw.edges || []).map((e) => ({
      from: e.from,
      to: e.to,
      kind: e.kind as EdgeKind,
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
