import { describe, expect, it } from "vitest";
import { isEmpty } from "./isEmpty";

describe("isEmpty", () => {
  it("should return true for an empty string", () => {
    expect(isEmpty("")).toBe(true);
  });

  it("should return false for a non-empty string", () => {
    expect(isEmpty("Hello")).toBe(false);
  });

  it("should return false for a number", () => {
    expect(isEmpty(123)).toBe(false);
  });

  it("should return false for an object", () => {
    expect(isEmpty({})).toBe(false);
  });

  it("should return false for an array", () => {
    expect(isEmpty([])).toBe(false);
  });

  it("should return false for null", () => {
    expect(isEmpty(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isEmpty(undefined)).toBe(false);
  });
});
