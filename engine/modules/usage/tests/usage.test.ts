import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { openUsageStore } from "../index";
import type { UsageStore } from "../../../contracts";

const limits = {
  perUserDailyRequests: 2,
  perUserDailyTokens: 1000,
  globalDailyRequests: 3,
};
const day1 = new Date("2026-11-24T10:00:00Z");
const day2 = new Date("2026-11-25T00:00:01Z");

let dir: string;
let store: UsageStore;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "usage-"));
  store = openUsageStore(join(dir, "usage.db"));
});

afterEach(() => {
  store.close();
  rmSync(dir, { recursive: true, force: true });
});

describe("openUsageStore", () => {
  it("starts with zero usage", () => {
    expect(store.today("u1", "m1", day1)).toEqual({ requests: 0, tokens: 0 });
    expect(store.globalToday("m1", day1)).toBe(0);
  });

  it("accumulates requests and tokens for one user and model", () => {
    store.record("u1", "m1", 100, day1);
    store.record("u1", "m1", 50, day1);
    expect(store.today("u1", "m1", day1)).toEqual({ requests: 2, tokens: 150 });
  });

  it("blocks a user after perUserDailyRequests", () => {
    store.record("u1", "m1", 10, day1);
    store.record("u1", "m1", 10, day1);
    expect(store.canUse("u1", "m1", limits, day1)).toBe(false);
  });

  it("blocks a user after perUserDailyTokens", () => {
    store.record("u1", "m1", 1000, day1);
    expect(store.canUse("u1", "m1", limits, day1)).toBe(false);
  });

  it("keeps limits separate per model", () => {
    store.record("u1", "m1", 10, day1);
    store.record("u1", "m1", 10, day1);
    expect(store.canUse("u1", "m1", limits, day1)).toBe(false);
    expect(store.canUse("u1", "m2", limits, day1)).toBe(true);
  });

  it("enforces the global cap across users", () => {
    store.record("u1", "m1", 1, day1);
    store.record("u2", "m1", 1, day1);
    store.record("u3", "m1", 1, day1);
    expect(store.globalToday("m1", day1)).toBe(3);
    expect(store.canUse("u4", "m1", limits, day1)).toBe(false);
  });

  it("resets at UTC midnight", () => {
    store.record("u1", "m1", 10, day1);
    store.record("u1", "m1", 10, day1);
    expect(store.canUse("u1", "m1", limits, day1)).toBe(false);
    expect(store.canUse("u1", "m1", limits, day2)).toBe(true);
    expect(store.today("u1", "m1", day2)).toEqual({ requests: 0, tokens: 0 });
  });

  it("rejects negative or fractional token counts", () => {
    expect(() => store.record("u1", "m1", -1, day1)).toThrow();
    expect(() => store.record("u1", "m1", 1.5, day1)).toThrow();
  });

  it("keeps data after reopening the same file", () => {
    const path = join(dir, "usage.db");
    store.record("u1", "m1", 42, day1);
    store.close();
    store = openUsageStore(path);
    expect(store.today("u1", "m1", day1)).toEqual({ requests: 1, tokens: 42 });
  });
});
