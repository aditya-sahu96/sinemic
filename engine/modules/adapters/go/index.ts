import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import type { LanguageAdapter, StackInfo, SymbolGraph, SymbolNode, SymbolEdge, CheckCommand, LanguageId } from "../../../contracts/types";
import { detectStack } from "../../stack";

const helperPath = path.join(__dirname, "helper", "main.go");

function runGo(projectPath: string): any {
  const out = execFileSync("go", ["run", helperPath, projectPath], { encoding: "utf8", timeout: 120000 });
  return JSON.parse(out);
}

export const goAdapter: LanguageAdapter = {
  id: "go",
  detect(projectPath: string): StackInfo | null {
    if (!fs.existsSync(path.join(projectPath, "go.mod"))) return null;
    return detectStack(projectPath);
  },
  extract(projectPath: string): SymbolGraph {
    const raw = runGo(projectPath);
    const nodes: SymbolNode[] = (raw.nodes || []).map((n: any) => ({
      id: n.id,
      name: n.name,
      kind: n.kind,
      filePath: n.filePath,
      startLine: n.startLine,
      endLine: n.endLine,
    }));
    const edges: SymbolEdge[] = (raw.edges || []).map((e: any) => ({
      from: e.from,
      to: e.to,
      kind: e.kind,
      resolved: !!e.resolved,
    }));
    return {
      language: "go",
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
      { name: "typecheck", command: ["go", "vet", "./..."], cwd: projectPath, timeoutMs: 180000 },
      { name: "test", command: ["go", "test", "./..."], cwd: projectPath, timeoutMs: 180000 },
      { name: "build", command: ["go", "build", "./..."], cwd: projectPath, timeoutMs: 180000 },
    ];
  },
};

export function buildGraph(language: LanguageId, graph: Omit<SymbolGraph, "language">): SymbolGraph {
  return { language, ...graph };
}

export default goAdapter;
export { goAdapter as adapter };
