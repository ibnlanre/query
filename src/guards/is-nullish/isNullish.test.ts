import { describe, expect, it } from "vitest";
import { isNullish } from "./isNullish";

describe("isNullish", () => {
  it("should return true for null", () => {
    expect(isNullish(null)).toBe(true);
  });

  it("should return true for undefined", () => {
    expect(isNullish(undefined)).toBe(true);
  });

  it("should return false for a non-nullish value", () => {
    expect(isNullish("Hello")).toBe(false);
  });

  it("should return false for a number", () => {
    expect(isNullish(123)).toBe(false);
  });

  it("should return false for an object", () => {
    expect(isNullish({})).toBe(false);
  });

  it("should return false for an array", () => {
    expect(isNullish([])).toBe(false);
  });
});
