import { describe, it, expect } from "vitest";
import path from "node:path";
import { detectStack } from "../index";

const fixtures = path.join(__dirname, "fixtures");

describe("detectStack", () => {
  it("detects nextjs typescript with high confidence", () => {
    const info = detectStack(path.join(fixtures, "ts-next"));
    expect(info.languages).toContain("typescript");
    expect(info.primaryLanguage).toBe("typescript");
    expect(info.framework).toBe("nextjs");
    expect(info.manifests).toContain("package.json");
    expect(info.confidence).toBe("high");
  });

  it("detects plain package.json without ts files as javascript medium", () => {
    const info = detectStack(path.join(fixtures, "ts-plain"));
    expect(info.languages).toContain("javascript");
    expect(info.framework).toBeNull();
    expect(info.confidence).toBe("medium");
  });

  it("detects js-only with source files high", () => {
    const info = detectStack(path.join(fixtures, "js-only"));
    expect(info.languages).toContain("javascript");
    expect(info.confidence).toBe("high");
  });

  it("detects django python", () => {
    const info = detectStack(path.join(fixtures, "py-django"));
    expect(info.languages).toContain("python");
    expect(info.framework).toBe("django");
    expect(info.confidence).toBe("medium");
  });

  it("detects plain python", () => {
    const info = detectStack(path.join(fixtures, "py-plain"));
    expect(info.languages).toContain("python");
    expect(info.framework).toBeNull();
  });

  it("detects gin go", () => {
    const info = detectStack(path.join(fixtures, "go-gin"));
    expect(info.languages).toContain("go");
    expect(info.framework).toBe("gin");
  });

  it("detects plain go", () => {
    const info = detectStack(path.join(fixtures, "go-plain"));
    expect(info.languages).toContain("go");
    expect(info.framework).toBeNull();
  });

  it("returns empty/low for empty folder", () => {
    const info = detectStack(path.join(fixtures, "empty"));
    expect(info.languages).toEqual([]);
    expect(info.primaryLanguage).toBeNull();
    expect(info.confidence).toBe("low");
  });
});
