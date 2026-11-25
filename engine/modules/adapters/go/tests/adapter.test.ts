import { describe, it, expect } from "vitest";
import path from "node:path";
import { execSync } from "node:child_process";
import { goAdapter } from "../index";

const root = path.join(__dirname, "fixtures", "go-tiny");

function goAvailable(): boolean {
  try {
    execSync("go version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

describe("go adapter", () => {
  it("detect returns non-null", () => {
    expect(goAdapter.detect(root)).not.toBeNull();
  });
  it("extract returns nodes or skips", () => {
    if (!goAvailable()) {
      console.log("SKIP: go not installed");
      return;
    }
    const g = goAdapter.extract(root);
    expect(g.language).toBe("go");
    expect(g.nodes.length).toBeGreaterThan(0);
  });
  it("checks returns three commands", () => {
    const c = goAdapter.checks(root);
    expect(c.length).toBe(3);
  });
});
