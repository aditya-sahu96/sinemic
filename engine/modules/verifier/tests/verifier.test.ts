import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { applyPatches, verify, secretScan } from "../index";

describe("verifier", () => {
  it("applyPatches copies and applies", () => {
    const src = fs.mkdtempSync(path.join(os.tmpdir(), "src-"));
    fs.writeFileSync(path.join(src, "a.txt"), "old", "utf8");
    const work = path.join(os.tmpdir(), "work-" + Date.now());
    const out = applyPatches(src, [{ path: "a.txt", newContent: "new" }], work);
    expect(out).toBe(work);
    expect(fs.readFileSync(path.join(work, "a.txt"), "utf8")).toBe("new");
    expect(fs.readFileSync(path.join(src, "a.txt"), "utf8")).toBe("old");
    fs.rmSync(src, { recursive: true, force: true });
    fs.rmSync(work, { recursive: true, force: true });
  });

  it("verify runs checks", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "v-"));
    const res = await verify(dir, [{ name: "typecheck", command: ["node", "-e", "process.exit(0)"], cwd: dir, timeoutMs: 5000 }]);
    expect(res.passed).toBe(true);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("secretScan finds planted key", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "s-"));
    fs.writeFileSync(path.join(dir, "x.txt"), "key sk-abcdefghijklmnopqrstuvwxyz123456", "utf8");
    const r = secretScan(dir);
    expect(r.passed).toBe(false);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
