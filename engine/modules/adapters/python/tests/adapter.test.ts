import { describe, it, expect } from "vitest";
import path from "node:path";
import { execSync } from "node:child_process";
import { pythonAdapter } from "../index";

const root = path.join(__dirname, "fixtures", "py-tiny");

function pythonAvailable(): boolean {
  try {
    execSync("python --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

describe("python adapter", () => {
  it("detect returns non-null", () => {
    expect(pythonAdapter.detect(root)).not.toBeNull();
  });
  it("extract returns nodes", () => {
    if (!pythonAvailable()) {
      console.log("SKIP: python not installed");
      return;
    }
    const g = pythonAdapter.extract(root);
    expect(g.language).toBe("python");
    expect(g.nodes.length).toBeGreaterThan(0);
    const names = g.nodes.map((n) => n.name);
    expect(names).toContain("add");
    expect(names).toContain("run");
  });
  it("checks returns two commands", () => {
    const c = pythonAdapter.checks(root);
    expect(c.length).toBe(2);
  });
});
