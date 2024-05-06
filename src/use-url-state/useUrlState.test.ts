import { expect, describe, it, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { useUrlState } from "./useUrlState";

beforeEach(() => {
  window.history.pushState({}, "", "/");
});

describe("useUrlQuery", () => {
  it("should set and get query parameters", () => {
    const { result } = renderHook(useUrlState);
    const search = result.current;

    search.set("name", "John");
    search.set("age", "20");

    expect(search.get("name")).to.equal("John");
    expect(search.get("age")).to.equal("20");
  });

  it("should set and get query parameters using object syntax", () => {
    const { result } = renderHook(useUrlState);
    const search = result.current;

    search.set.record({ name: "John", age: "20" });

    expect(search.get("name")).to.equal("John");
    expect(search.get("age")).to.equal("20");
  });

  it("should remove query parameters", () => {
    const { result } = renderHook(useUrlState);
    const search = result.current;

    search.set("name", "John");
    search.remove("name");

    expect(search.get("name")).to.equal("");
  });

  it("should get query parameters with fallback values", () => {
    const { result } = renderHook(useUrlState);
    const search = result.current;

    expect(search.get("name", "John")).to.equal("John");
    expect(search.get("age", "20")).to.equal("20");
  });

  it("should get query parameters with type casting", () => {
    const { result } = renderHook(useUrlState);
    const search = result.current;

    search.set("age", "20");

    expect(search.get.number("age")).to.equal(20);
    expect(search.get.boolean("age")).to.equal(true);
    expect(search.get.parse<number>("age")).to.equal(20);
  });

  it("should parse query parameters", () => {
    const { result } = renderHook(useUrlState);
    const search = result.current;

    const parsedName = search.get.parse("name", {
      fallback: "john",
      reviver: (value) => value.toUpperCase(),
    });
    expect(parsedName).to.equal("JOHN");

    const parsedAge = search.get.number("age", 20);
    expect(parsedAge).to.equal(20);
  });
});
