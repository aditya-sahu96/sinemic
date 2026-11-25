import { describe, it, expect } from "vitest";
import path from "node:path";
import { typescriptAdapter } from "../index";

const root = path.join(__dirname, "fixtures", "ts-tiny");

describe("typescript adapter", () => {
  it("detect returns non-null when tsconfig exists", () => {
    expect(typescriptAdapter.detect(root)).not.toBeNull();
  });
  it("extract returns nodes", () => {
    const g = typescriptAdapter.extract(root);
    expect(g.language).toBe("typescript");
    expect(g.nodes.length).toBeGreaterThan(0);
    const names = g.nodes.map((n) => n.name);
    expect(names).toContain("add");
    expect(names).toContain("run");
  });
  it("checks returns two commands", () => {
    const c = typescriptAdapter.checks(root);
    expect(c.length).toBe(2);
    expect(c[0].command).toEqual(["npx", "tsc", "--noEmit"]);
  });
});
