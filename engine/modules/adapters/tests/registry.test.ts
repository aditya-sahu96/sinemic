import { describe, it, expect } from "vitest";
import { getAdapter } from "../index";

describe("adapter registry", () => {
  it("returns typescript adapter for typescript and javascript", () => {
    expect(getAdapter("typescript").id).toBe("typescript");
    expect(getAdapter("javascript").id).toBe("typescript");
  });
  it("returns python adapter", () => {
    expect(getAdapter("python").id).toBe("python");
  });
  it("returns go adapter", () => {
    expect(getAdapter("go").id).toBe("go");
  });
  it("throws for unknown id", () => {
    expect(() => getAdapter("rust" as any)).toThrow();
  });
});
