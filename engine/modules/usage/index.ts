// modules/usage (P12, contracts-v3)
// Per-user, per-model daily limits stored in SQLite. Days are UTC.
import Database from "better-sqlite3";
import type { UsageLimits, UsageStore } from "../../contracts";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS usage (
  user_id  TEXT NOT NULL,
  model_id TEXT NOT NULL,
  day      TEXT NOT NULL,
  requests INTEGER NOT NULL DEFAULT 0,
  tokens   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, model_id, day)
);
CREATE INDEX IF NOT EXISTS usage_model_day ON usage (model_id, day);
`;

function utcDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function assertNonNegativeInt(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer, got ${value}`);
  }
}

export function openUsageStore(dbPath: string): UsageStore {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);

  const selectUser = db.prepare(
    "SELECT requests, tokens FROM usage WHERE user_id = ? AND model_id = ? AND day = ?",
  );
  const selectGlobal = db.prepare(
    "SELECT COALESCE(SUM(requests), 0) AS requests FROM usage WHERE model_id = ? AND day = ?",
  );
  const upsert = db.prepare(`
    INSERT INTO usage (user_id, model_id, day, requests, tokens)
    VALUES (?, ?, ?, 1, ?)
    ON CONFLICT (user_id, model_id, day)
    DO UPDATE SET requests = requests + 1, tokens = tokens + excluded.tokens
  `);

  function today(userId: string, modelId: string, now: Date = new Date()) {
    const row = selectUser.get(userId, modelId, utcDay(now)) as
      | { requests: number; tokens: number }
      | undefined;
    return { requests: row?.requests ?? 0, tokens: row?.tokens ?? 0 };
  }

  function globalToday(modelId: string, now: Date = new Date()): number {
    const row = selectGlobal.get(modelId, utcDay(now)) as { requests: number };
    return row.requests;
  }

  return {
    canUse(userId, modelId, limits: UsageLimits, now = new Date()): boolean {
      const used = today(userId, modelId, now);
      if (used.requests >= limits.perUserDailyRequests) return false;
      if (used.tokens >= limits.perUserDailyTokens) return false;
      if (globalToday(modelId, now) >= limits.globalDailyRequests) return false;
      return true;
    },

    record(userId, modelId, tokens, now = new Date()): void {
      assertNonNegativeInt(tokens, "tokens");
      upsert.run(userId, modelId, utcDay(now), tokens);
    },

    today,
    globalToday,

    close(): void {
      db.close();
    },
  };
}
