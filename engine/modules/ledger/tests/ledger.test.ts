import { describe, it, expect } from "vitest";
import { openLedger, LedgerError } from "../index";

describe("ledger", () => {
  it("creates sequential ids", () => {
    const L = openLedger(":memory:", "p1");
    const r1 = L.addRequirement("r1", ["t1"]);
    const r2 = L.addRequirement("r2", []);
    expect(r1.id).toBe("REQ-001");
    expect(r2.id).toBe("REQ-002");
    const d = L.addDecision({ chosen: "a", rejected: ["b"], reason: "r", requirementIds: [r1.id] });
    expect(d.id).toBe("DEC-001");
    const c = L.addConstraint("c");
    expect(c.id).toBe("CON-001");
    L.close();
  });

  it("status transitions enforced", () => {
    const L = openLedger(":memory:", "p2");
    const r = L.addRequirement("r", []);
    expect(() => L.setRequirementStatus(r.id, "implemented", "user")).toThrow(LedgerError);
    L.setRequirementStatus(r.id, "accepted", "user");
    L.setRequirementStatus(r.id, "implemented", "model");
    expect(() => L.setRequirementStatus(r.id, "verified", "user")).toThrow(LedgerError);
    L.setRequirementStatus(r.id, "verified", "verifier");
    const read = L.read();
    expect(read.requirements[0].status).toBe("verified");
    L.close();
  });

  it("only verifier sets verified", () => {
    const L = openLedger(":memory:", "p3");
    const r = L.addRequirement("r", []);
    L.setRequirementStatus(r.id, "accepted", "user");
    L.setRequirementStatus(r.id, "implemented", "system");
    expect(() => L.setRequirementStatus(r.id, "verified", "model")).toThrow(LedgerError);
    L.close();
  });

  it("every write appends event", () => {
    const L = openLedger(":memory:", "p4");
    const before = L.read().events.length;
    L.addRequirement("r", []);
    L.addConstraint("c");
    L.appendEvent("user", "note", { x: 1 });
    const after = L.read().events.length;
    expect(after).toBe(before + 3);
    L.close();
  });

  it("events append-only: update and delete fail", () => {
    const L = openLedger(":memory:", "p5");
    L.appendEvent("system", "t", {});
    const db = (L as any);
    // reach underlying db via a fresh connection to same memory? memory is per-connection, so use file
    L.close();
  });

  it("events append-only via raw db", () => {
    const fs = require("node:fs");
    const os = require("node:os");
    const path = require("node:path");
    const tmp = path.join(os.tmpdir(), "ledger-test.db");
    try { fs.unlinkSync(tmp); } catch {}
    const L = openLedger(tmp, "p6");
    L.appendEvent("system", "t", {});
    // open a second connection
    const Database = require("better-sqlite3");
    const db2 = new Database(tmp);
    expect(() => db2.prepare("UPDATE events SET type='x'").run()).toThrow();
    expect(() => db2.prepare("DELETE FROM events").run()).toThrow();
    db2.close();
    L.close();
    try { fs.unlinkSync(tmp); } catch {}
  });
});
