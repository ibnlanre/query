import { describe, expect, it } from "vitest";
import { assign } from "./assign";

describe("assign", () => {
  it("should assign properties from source to target", () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    const result = assign(target, source);
    expect(result).deep.equal({ a: 1, b: 3, c: 4 });
  });

  it("should not modify the original target object", () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    assign(target, source);
    expect(target).deep.equal({ a: 1, b: 2 });
  });

  it("should return a new object with assigned properties", () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    const result = assign(target, source);
    expect(result).not.toBe(target);
    expect(result).not.toBe(source);
  });

  it("should handle empty source object", () => {
    const target = { a: 1, b: 2 };
    const source = {};
    const result = assign(target, source);
    expect(result).deep.equal({ a: 1, b: 2 });
  });

  it("should handle empty target object", () => {
    const target = {};
    const source = { a: 1, b: 2 };
    const result = assign(target, source);
    expect(result).deep.equal({ a: 1, b: 2 });
  });

  it("should handle empty target and source objects", () => {
    const target = {};
    const source = {};
    const result = assign(target, source);
    expect(result).deep.equal({});
  });
});
