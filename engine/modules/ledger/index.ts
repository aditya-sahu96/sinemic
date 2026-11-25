import Database from "better-sqlite3";
import type { Ledger, Requirement, Decision, Constraint, ReqStatus, LedgerEvent } from "../../contracts/types";
import type { LedgerStore } from "../../contracts";

export class LedgerError extends Error {}

const STATUS_ORDER: ReqStatus[] = ["proposed", "accepted", "implemented", "verified"];

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

function nextId(db: Database.Database, table: string, prefix: string): string {
  const row = db.prepare(`SELECT id FROM ${table} ORDER BY id DESC LIMIT 1`).get() as { id: string } | undefined;
  let n = 0;
  if (row) {
    const m = row.id.match(new RegExp(`^${prefix}-(\\d+)$`));
    if (m) n = parseInt(m[1], 10);
  }
  return `${prefix}-${pad(n + 1)}`;
}

function nextEventId(db: Database.Database): string {
  const row = db.prepare("SELECT id FROM events ORDER BY id DESC LIMIT 1").get() as { id: string } | undefined;
  let n = 0;
  if (row) {
    const m = row.id.match(/^EVT-(\d+)$/);
    if (m) n = parseInt(m[1], 10);
  }
  return `EVT-${pad(n + 1)}`;
}

export function openLedger(dbPath: string, projectId: string): LedgerStore {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS requirements (
      id               TEXT PRIMARY KEY,
      text             TEXT NOT NULL,
      status           TEXT NOT NULL CHECK (status IN ('proposed','accepted','implemented','verified')),
      acceptance_tests TEXT NOT NULL DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS decisions (
      id              TEXT PRIMARY KEY,
      chosen          TEXT NOT NULL,
      rejected        TEXT NOT NULL DEFAULT '[]',
      reason          TEXT NOT NULL,
      requirement_ids TEXT NOT NULL DEFAULT '[]',
      created_at      TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS constraints (
      id   TEXT PRIMARY KEY,
      text TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      id      TEXT PRIMARY KEY,
      at      TEXT NOT NULL,
      actor   TEXT NOT NULL CHECK (actor IN ('user','verifier','model','system')),
      type    TEXT NOT NULL,
      payload TEXT NOT NULL
    );
    CREATE TRIGGER IF NOT EXISTS events_no_update BEFORE UPDATE ON events
    BEGIN SELECT RAISE(ABORT, 'events are append-only'); END;
    CREATE TRIGGER IF NOT EXISTS events_no_delete BEFORE DELETE ON events
    BEGIN SELECT RAISE(ABORT, 'events are append-only'); END;
  `);

  const upsertMeta = db.prepare("INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  upsertMeta.run("project_id", projectId);
  upsertMeta.run("schema_version", "1");

  function readLedger(): Ledger {
    const reqs = db.prepare("SELECT id, text, status, acceptance_tests FROM requirements").all() as Array<{ id: string; text: string; status: string; acceptance_tests: string }>;
    const decs = db.prepare("SELECT id, chosen, rejected, reason, requirement_ids, created_at FROM decisions").all() as Array<{ id: string; chosen: string; rejected: string; reason: string; requirement_ids: string; created_at: string }>;
    const cons = db.prepare("SELECT id, text FROM constraints").all() as Array<{ id: string; text: string }>;
    const evs = db.prepare("SELECT id, at, actor, type, payload FROM events ORDER BY id").all() as Array<{ id: string; at: string; actor: string; payload: string; type: string }>;

    return {
      projectId,
      requirements: reqs.map((r) => ({
        id: r.id,
        text: r.text,
        status: r.status as ReqStatus,
        acceptanceTests: JSON.parse(r.acceptance_tests) as string[],
      })),
      decisions: decs.map((d) => ({
        id: d.id,
        chosen: d.chosen,
        rejected: JSON.parse(d.rejected) as string[],
        reason: d.reason,
        requirementIds: JSON.parse(d.requirement_ids) as string[],
        createdAt: d.created_at,
      })),
      constraints: cons.map((c) => ({ id: c.id, text: c.text })),
      events: evs.map((e) => ({
        id: e.id,
        at: e.at,
        actor: e.actor as LedgerEvent["actor"],
        type: e.type,
        payload: JSON.parse(e.payload),
      })),
    };
  }

  function appendEvent(actor: LedgerEvent["actor"], type: string, payload: unknown): void {
    const id = nextEventId(db);
    const at = new Date().toISOString();
    db.prepare("INSERT INTO events (id, at, actor, type, payload) VALUES (?, ?, ?, ?, ?)").run(
      id, at, actor, type, JSON.stringify(payload),
    );
  }

  const store: LedgerStore = {
    read(): Ledger {
      return readLedger();
    },
    addRequirement(text: string, acceptanceTests: string[]): Requirement {
      const id = nextId(db, "requirements", "REQ");
      db.prepare("INSERT INTO requirements (id, text, status, acceptance_tests) VALUES (?, ?, ?, ?)").run(
        id, text, "proposed", JSON.stringify(acceptanceTests),
      );
      const req: Requirement = { id, text, status: "proposed", acceptanceTests };
      appendEvent("system", "requirement.added", req);
      return req;
    },
    addDecision(input: Omit<Decision, "id" | "createdAt">): Decision {
      const id = nextId(db, "decisions", "DEC");
      const createdAt = new Date().toISOString();
      const decision: Decision = { id, createdAt, ...input };
      db.prepare("INSERT INTO decisions (id, chosen, rejected, reason, requirement_ids, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
        id, decision.chosen, JSON.stringify(decision.rejected), decision.reason, JSON.stringify(decision.requirementIds), createdAt,
      );
      appendEvent("system", "decision.added", decision);
      return decision;
    },
    addConstraint(text: string): Constraint {
      const id = nextId(db, "constraints", "CON");
      db.prepare("INSERT INTO constraints (id, text) VALUES (?, ?)").run(id, text);
      const c: Constraint = { id, text };
      appendEvent("system", "constraint.added", c);
      return c;
    },
    setRequirementStatus(id: string, status: ReqStatus, actor: "user" | "verifier" | "model" | "system"): Requirement {
      const row = db.prepare("SELECT text, status, acceptance_tests FROM requirements WHERE id = ?").get(id) as { text: string; status: string; acceptance_tests: string } | undefined;
      if (!row) throw new LedgerError(`requirement not found: ${id}`);
      const current = row.status as ReqStatus;
      if (status === "verified" && actor !== "verifier") throw new LedgerError("only verifier may set verified");
      const ci = STATUS_ORDER.indexOf(current);
      const ni = STATUS_ORDER.indexOf(status);
      if (ni !== ci + 1) throw new LedgerError(`invalid transition ${current} -> ${status}`);
      db.prepare("UPDATE requirements SET status = ? WHERE id = ?").run(status, id);
      const req: Requirement = { id, text: row.text, status, acceptanceTests: JSON.parse(row.acceptance_tests) as string[] };
      appendEvent(actor, "requirement.status_changed", { id, from: current, to: status, actor });
      return req;
    },
    appendEvent(actor, type, payload): void {
      appendEvent(actor, type, payload);
    },
    close(): void {
      db.close();
    },
  };

  return store;
}
