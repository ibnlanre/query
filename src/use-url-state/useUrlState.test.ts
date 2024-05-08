import "@testing-library/jest-dom/vitest";

import { renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { UrlStateProvider } from "../url-state-provider";
import { useUrlState } from "./useUrlState";

beforeEach(() => {
  window.history.pushState({}, "", "/");
});

describe("useUrlQuery", () => {
  it("should throw an error when used outside of a UrlStateProvider", () => {
    expect(() => renderHook(() => useUrlState())).to.throw(
      /must be used within a UrlStateProvider/
    );
  });

  it("should set and get query parameters", () => {
    const { result } = renderHook(() => useUrlState(), {
      wrapper: UrlStateProvider,
    });
    const search = result.current;

    search.set("name", "John");
    search.set("age", "20");

    expect(search.get("name")).to.have.members(["John"]);
    expect(search.get("age")).to.have.members(["20"]);
  });

  it("should set a record of query parameters", () => {
    const { result } = renderHook(() => useUrlState(), {
      wrapper: UrlStateProvider,
    });
    const search = result.current;

    search.set.record({ name: "John", age: "20" });

    expect(search.get("name")).to.have.members(["John"]);
    expect(search.get("age")).to.have.members(["20"]);
    expect(search.value).to.equal("name=John&age=20");
  });

  it("should set and get query parameters using object syntax", () => {
    const { result } = renderHook(() => useUrlState(), {
      wrapper: UrlStateProvider,
    });

    const search = result.current;
    search.set.record({ name: "John", age: "20" });

    expect(search.get("name")).to.have.members(["John"]);
    expect(search.get("age")).to.have.members(["20"]);
  });

  it("should remove query parameters", () => {
    const { result } = renderHook(() => useUrlState(), {
      wrapper: UrlStateProvider,
    });
    const search = result.current;

    search.set("name", "John");
    search.remove("name");

    expect(search.get("name")).to.have.members([]);
  });

  it("should get query parameters with fallback values", () => {
    const { result } = renderHook(() => useUrlState(), {
      wrapper: UrlStateProvider,
    });
    const search = result.current;

    expect(search.get("name", "John")).to.have.members(["John"]);
    expect(search.get("age", "20")).to.have.members(["20"]);
  });

  it("should get query parameters with type casting", () => {
    const { result } = renderHook(() => useUrlState(), {
      wrapper: UrlStateProvider,
    });

    const search = result.current;
    search.set("age", "20");

    expect(search.get.number("age")).to.have.members([20]);
    expect(search.get.boolean("age")).to.have.members([true]);
    expect(search.get.parse<number>("age")).to.have.members([20]);
  });

  it("should parse query parameters", () => {
    const { result } = renderHook(
      () =>
        useUrlState({
          reviver: (key, value) => {
            if (typeof value === "string") return value.toUpperCase();
          },
        }),
      {
        wrapper: UrlStateProvider,
      }
    );

    const search = result.current;
    search.set.stringify("name", "john");

    const parsedName = search.get.parse("name", "john");
    expect(parsedName).to.have.members(["JOHN"]);

    const parsedAge = search.get.number("age", 20);
    expect(parsedAge).to.have.members([20]);
  });
});
