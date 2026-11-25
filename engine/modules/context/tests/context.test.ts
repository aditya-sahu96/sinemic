import { describe, it, expect } from "vitest";
import { compilePack } from "../index";
import { openLedger } from "../../ledger";
import type { Selection, SymbolGraph, SymbolNode } from "../../../contracts/types";
import { CONTRACTS_VERSION } from "../../../contracts/types";

function node(id: string): SymbolNode {
  return { id, name: id, kind: "function", filePath: "a.ts", startLine: 1, endLine: 2, signature: "function " + id + "()" };
}

describe("compilePack", () => {
  it("budget never exceeded and dropped listed", () => {
    const L = openLedger(":memory:", "p");
    L.addRequirement("r1", ["t"]);
    const r = L.read().requirements[0];
    L.setRequirementStatus(r.id, "accepted", "user");
    L.addDecision({ chosen: "x", rejected: ["y"], reason: "because", requirementIds: [r.id] });
    L.addConstraint("c1");
    const graph: SymbolGraph = { language: "typescript", nodes: [node("a#foo")], edges: [], coverage: { filesParsed: 1, filesSkipped: 0, skippedReasons: [] } };
    const selection: Selection = { taskTargets: ["a#foo"], symbols: [node("a#foo")], callers: [], reasons: { "a#foo": "target" }, dropped: [] };
    const pack = compilePack(L.read(), selection, graph, 40);
    expect(pack.tokenEstimate).toBeLessThanOrEqual(40);
    expect(pack.text.startsWith("# Context Pack")).toBe(true);
    expect(pack.text).toContain(`Contracts: ${CONTRACTS_VERSION}`);
    expect(pack.text).toContain("Project: p");
    expect(pack.doNotRePropose).toContain("y: because");
    L.close();
  });
});
