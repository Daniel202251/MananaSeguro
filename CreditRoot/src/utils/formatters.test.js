import { describe, it, expect } from "vitest";
import {
  formatCurrencyUsd,
  formatCurrencyMxn,
  formatPercentage,
} from "./formatters";

describe("formatCurrencyUsd", () => {
  it("formats a positive value with $ prefix and thousands separator", () => {
    expect(formatCurrencyUsd(1234)).toBe("$1,234");
  });

  it("formats zero as $0", () => {
    expect(formatCurrencyUsd(0)).toBe("$0");
  });

  it("formats negative values with -$ prefix", () => {
    expect(formatCurrencyUsd(-500)).toBe("-$500");
  });

  it("formats large values with thousands separators", () => {
    expect(formatCurrencyUsd(1000000)).toBe("$1,000,000");
  });

  it("formats small values without decimals", () => {
    expect(formatCurrencyUsd(5)).toBe("$5");
  });

  it("formats thousands without decimals", () => {
    expect(formatCurrencyUsd(999999)).toBe("$999,999");
  });
});

describe("formatCurrencyMxn", () => {
  it("formats a positive value with es-MX locale", () => {
    const result = formatCurrencyMxn(1234);
    expect(result).toContain("$");
    expect(result).toContain("1");
    expect(result).toContain("234");
  });

  it("formats zero with es-MX locale", () => {
    expect(formatCurrencyMxn(0)).toContain("$");
  });

  it("formats negative values", () => {
    const result = formatCurrencyMxn(-500);
    expect(result).toContain("$");
    expect(result).toContain("500");
  });

  it("formats large values with thousands separators", () => {
    const result = formatCurrencyMxn(1000000);
    expect(result).toContain("$");
    expect(result).toContain("1");
    expect(result.length).toBeGreaterThan(6);
  });

  it("uses maximumFractionDigits: 0 (no decimals)", () => {
    const result = formatCurrencyMxn(1234.56);
    expect(result).not.toContain(".");
  });
});

describe("formatPercentage", () => {
  it("formats a decimal value with one decimal place", () => {
    expect(formatPercentage(4.7)).toBe("4.7%");
  });

  it("formats a whole number with .0", () => {
    expect(formatPercentage(5)).toBe("5.0%");
  });

  it("formats zero as 0.0%", () => {
    expect(formatPercentage(0)).toBe("0.0%");
  });

  it("formats negative values", () => {
    expect(formatPercentage(-2.3)).toBe("-2.3%");
  });

  it("formats large percentages", () => {
    expect(formatPercentage(99.99)).toBe("100.0%");
  });

  it("rounds to one decimal place", () => {
    expect(formatPercentage(3.456)).toBe("3.5%");
  });

  it("formats 100 percent", () => {
    expect(formatPercentage(100)).toBe("100.0%");
  });
});
