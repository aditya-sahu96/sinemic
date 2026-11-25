import { describe, it, expect } from "vitest";
import { selectContext } from "../index";
import type { SymbolGraph, SymbolNode } from "../../../contracts/types";

function node(id: string, file = "a.ts"): SymbolNode {
  return { id, name: id.split("#")[1], kind: "function", filePath: file, startLine: 1, endLine: 2 };
}

describe("selectContext", () => {
  it("ranks targets first and includes neighbours", () => {
    const graph: SymbolGraph = {
      language: "typescript",
      nodes: [node("a#foo"), node("a#bar"), node("a#baz")],
      edges: [
        { from: "a#foo", to: "a#bar", kind: "calls", resolved: true },
        { from: "a#baz", to: "a#foo", kind: "calls", resolved: true },
      ],
      coverage: { filesParsed: 1, filesSkipped: 0, skippedReasons: [] },
    };
    const sel = selectContext(graph, ["a#foo"], 10);
    expect(sel.symbols[0].id).toBe("a#foo");
    expect(sel.symbols.map((s) => s.id)).toContain("a#bar");
    expect(sel.symbols.map((s) => s.id)).toContain("a#baz");
    expect(sel.reasons["a#foo"]).toBe("target");
  });
  it("cuts at maxSymbols", () => {
    const nodes = [node("a#t"), node("a#n1"), node("a#n2"), node("a#n3")];
    const graph: SymbolGraph = {
      language: "typescript",
      nodes,
      edges: [
        { from: "a#t", to: "a#n1", kind: "calls", resolved: true },
        { from: "a#t", to: "a#n2", kind: "calls", resolved: true },
        { from: "a#t", to: "a#n3", kind: "calls", resolved: true },
      ],
      coverage: { filesParsed: 1, filesSkipped: 0, skippedReasons: [] },
    };
    const sel = selectContext(graph, ["a#t"], 2);
    expect(sel.symbols.length).toBe(2);
    expect(sel.dropped.length).toBe(2);
  });
});
