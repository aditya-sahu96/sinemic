import type { SymbolGraph, Selection, SymbolNode } from "../../contracts/types";

export function selectContext(graph: SymbolGraph, taskTargets: string[], maxSymbols: number = 25): Selection {
  const nodeById = new Map<string, SymbolNode>(graph.nodes.map((n) => [n.id, n]));
  const adj = new Map<string, Set<string>>();
  const rev = new Map<string, Set<string>>();
  for (const n of graph.nodes) {
    adj.set(n.id, new Set());
    rev.set(n.id, new Set());
  }
  for (const e of graph.edges) {
    if (e.kind === "calls" || e.kind === "imports") {
      if (adj.has(e.from)) adj.get(e.from)!.add(e.to);
      // reverse: to may not be a node id (name); only track if node exists
      if (rev.has(e.to)) rev.get(e.to)!.add(e.from);
    }
  }

  // resolve targets to symbol ids
  const targetIds: string[] = [];
  for (const t of taskTargets) {
    if (nodeById.has(t)) targetIds.push(t);
    else {
      // file path: all nodes in that file
      for (const n of graph.nodes) if (n.filePath === t) targetIds.push(n.id);
    }
  }

  const reasons: Record<string, string> = {};
  const ordered: string[] = [];
  const seen = new Set<string>();

  function enqueue(id: string, reason: string, rank: number) {
    if (seen.has(id)) return;
    if (!nodeById.has(id)) return;
    seen.add(id);
    ordered.push(id);
    reasons[id] = reason;
  }

  // rank 0: targets
  for (const id of targetIds) enqueue(id, "target", 0);

  // rank 1: direct neighbours
  const rank1: string[] = [];
  for (const id of targetIds) {
    for (const c of adj.get(id) ?? []) if (nodeById.has(c) && !seen.has(c)) rank1.push(c);
    for (const c of rev.get(id) ?? []) if (nodeById.has(c) && !seen.has(c)) rank1.push(c);
  }
  for (const id of rank1) {
    // determine reason
    let reason = "related";
    // if any target calls it
    for (const t of targetIds) {
      if ((adj.get(t) ?? new Set()).has(id)) reason = `called by target? actually callee of ${t}`.replace("called by target? actually callee of", "called by target?"); 
    }
    // simpler reason labels
    reason = "direct neighbour";
    enqueue(id, reason, 1);
  }

  // rank 2: neighbours of neighbours
  const rank2: string[] = [];
  for (const id of [...seen]) {
    for (const c of adj.get(id) ?? []) if (nodeById.has(c) && !seen.has(c)) rank2.push(c);
    for (const c of rev.get(id) ?? []) if (nodeById.has(c) && !seen.has(c)) rank2.push(c);
  }
  for (const id of rank2) enqueue(id, "indirect neighbour", 2);

  // assign better reasons: recompute reasons based on relation to targets
  for (const id of ordered) {
    if (targetIds.includes(id)) { reasons[id] = "target"; continue; }
    // caller?
    let isCaller = false, isCallee = false;
    for (const t of targetIds) {
      if ((rev.get(t) ?? new Set()).has(id)) isCaller = true;
      if ((adj.get(t) ?? new Set()).has(id)) isCallee = true;
    }
    if (isCaller && !isCallee) reasons[id] = "calls target";
    else if (isCallee && !isCaller) reasons[id] = "called by target";
    else if (isCaller && isCallee) reasons[id] = "mutual";
  }

  const includedIds = ordered.slice(0, maxSymbols);
  const droppedIds = ordered.slice(maxSymbols);

  const symbols: SymbolNode[] = includedIds.map((id) => nodeById.get(id)!);
  const callers: SymbolNode[] = targetIds.flatMap((t) => [...(rev.get(t) ?? new Set())])
    .filter((id, i, arr) => arr.indexOf(id) === i && nodeById.has(id))
    .map((id) => nodeById.get(id)!);

  return {
    taskTargets,
    symbols,
    callers,
    reasons: Object.fromEntries(includedIds.map((id) => [id, reasons[id]])),
    dropped: droppedIds,
  };
}
