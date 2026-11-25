import { CONTRACTS_VERSION } from "../../contracts/types";
import type { Ledger, Selection, SymbolGraph, ContextPack } from "../../contracts/types";

export function compilePack(ledger: Ledger, selection: Selection, graph: SymbolGraph, budgetTokens: number = 6000): ContextPack {
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  const header = `# Context Pack\nContracts: ${CONTRACTS_VERSION}\nProject: ${ledger.projectId}\n`;
  const items: { id: string; chunk: string }[] = [];

  for (const c of ledger.constraints) {
    items.push({ id: c.id, chunk: `## Constraint ${c.id}\n${c.text}\n` });
  }

  const unverified = ledger.requirements.filter((r) => r.status !== "verified");
  for (const r of unverified) {
    items.push({ id: r.id, chunk: `## Requirement ${r.id} (${r.status})\n${r.text}\nTests: ${r.acceptanceTests.join("; ")}\n` });
  }

  const unverifiedIds = new Set(unverified.map((r) => r.id));
  const linkedDecisions = ledger.decisions.filter((d) => d.requirementIds.some((rid) => unverifiedIds.has(rid)));
  for (const d of linkedDecisions) {
    items.push({ id: d.id, chunk: `## Decision ${d.id}\nChosen: ${d.chosen}\nReason: ${d.reason}\n` });
  }

  for (const s of selection.symbols) {
    const node = nodeById.get(s.id);
    const sig = node?.signature ?? "";
    items.push({ id: s.id, chunk: `## Symbol ${s.id}\n${sig}\n` });
  }

  const doNotRePropose: string[] = [];
  for (const d of ledger.decisions) {
    for (const r of d.rejected) {
      doNotRePropose.push(`${r}: ${d.reason}`);
    }
  }

  let text = header;
  let tokens = Math.ceil(header.length / 4);
  const included: string[] = [];
  const dropped: { id: string; reason: string }[] = [];
  let stopped = false;

  for (const item of items) {
    if (stopped) {
      dropped.push({ id: item.id, reason: "budget" });
      continue;
    }
    const itemTokens = Math.ceil(item.chunk.length / 4);
    if (tokens + itemTokens <= budgetTokens) {
      text += item.chunk;
      tokens += itemTokens;
      included.push(item.id);
    } else {
      dropped.push({ id: item.id, reason: "budget" });
      stopped = true;
    }
  }

  const dnpChunk = doNotRePropose.length ? `## Do Not Re-Propose\n${doNotRePropose.join("\n")}\n` : "";
  if (dnpChunk && !stopped) {
    const t = Math.ceil(dnpChunk.length / 4);
    if (tokens + t <= budgetTokens) {
      text += dnpChunk;
      tokens += t;
    } else {
      stopped = true;
    }
  }

  return {
    text,
    tokenEstimate: tokens,
    budget: budgetTokens,
    included,
    dropped,
    doNotRePropose,
  };
}
