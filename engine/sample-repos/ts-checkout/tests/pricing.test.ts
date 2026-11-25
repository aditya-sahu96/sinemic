import { describe, it, expect } from "vitest";
import { calculateTotal } from "../src/pricing";
import { checkout } from "../src/checkout";

describe("pricing", () => {
  it("calculates total", () => {
    expect(calculateTotal([{ price: 10, qty: 2 }])).toBe(20);
  });
  it("applies discount", () => {
    expect(checkout([{ price: 10, qty: 2 }])).toBe(18);
  });
});
