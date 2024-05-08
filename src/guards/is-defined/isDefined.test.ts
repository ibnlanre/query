import { describe, expect, it } from "vitest";
import { isDefined } from "./isDefined";

describe("isDefined", () => {
  it("should return true for a non-empty string", () => {
    expect(isDefined("Hello")).toBe(true);
  });

  it("should return true for a non-nullish object", () => {
    expect(isDefined({})).toBe(true);
  });

  it("should return true for a non-nullish array", () => {
    expect(isDefined([])).toBe(true);
  });

  it("should return false for an empty string", () => {
    expect(isDefined("")).toBe(false);
  });

  it("should return false for null", () => {
    expect(isDefined(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isDefined(undefined)).toBe(false);
  });
});
