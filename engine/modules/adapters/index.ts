import type { LanguageAdapter, LanguageId, SymbolGraph } from "../../contracts/types";
import { typescriptAdapter } from "./typescript";
import { pythonAdapter } from "./python";
import { goAdapter } from "./go";

export function getAdapter(id: LanguageId): LanguageAdapter {
  switch (id) {
    case "typescript":
    case "javascript":
      return typescriptAdapter;
    case "python":
      return pythonAdapter;
    case "go":
      return goAdapter;
    default:
      throw new Error(`Unknown language adapter: ${String(id)}`);
  }
}

export function buildGraph(language: LanguageId, graph: Omit<SymbolGraph, "language">): SymbolGraph {
  return { language, ...graph };
}

export { typescriptAdapter } from "./typescript";
export { pythonAdapter } from "./python";
export { goAdapter } from "./go";

export default { getAdapter, buildGraph };
