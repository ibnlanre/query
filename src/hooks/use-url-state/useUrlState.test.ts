import "@testing-library/jest-dom/vitest";

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { UrlStateProvider } from "../url-state-provider";
import { useUrlState } from "./useUrlState";

beforeEach(() => {
  window.history.pushState({}, "", "/");
});

const href =
  "https://www.google.com/search?sca_esv=74c740cd3a771c52&sca_upv=1&sxsrf=ADLYWILejntYmNv24qH5TFto9-Qb4zdryQ:1715179802897&q=parts+of+a+url&uds=ADvngMi-zfLdc8ZymLdbjnGOGv5u1fnVMK2SY1ax4Ym8t-sTFhKWG2Avw2T4evh_ibdIdcKgmrvg1oeIdTFN8Nyi-EO0737ObZQHvnvOvRhQ3PXyfmOfs5CDG2M0bbXo7iN_cSvEZjgW6OT8S4KXE8aeWvWil5kH-p87f2QXaCwv-_-3d-O8z82gD0mO3YpdSGel3cWb5s7nzOEUVLyr6DW7p5tACChVyy05N8j7VbEsZXaN1QzIoEvtQl2VoMrj6AC3RZT3C9MG1rVnpYvQ1UAjQT2jyaUM8WeyecB2MbJjck0ZlGEXk9I&udm=2&prmd=ivsnbmz&sa=X&sqi=2&ved=2ahUKEwj6mYLXpv6FAxWPWEEAHTNUDwYQtKgLegQIKhAB&biw=1555&bih=926&dpr=2#imgrc=f_fLwPkE5SKpEM&imgdii=lwAx0AhMdEfb2M";

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
    const { search } = result.current;

    search.set("name", "John");
    search.set("age", "20");

    expect(search.get("name")).to.have.members(["John"]);
    expect(search.get("age")).to.have.members(["20"]);
  });

  it("should set a record of query parameters", () => {
    const { result } = renderHook(() => useUrlState(), {
      wrapper: UrlStateProvider,
    });
    const { search } = result.current;

    search.set.record({ name: "John", age: "20" });

    expect(search.get("name")).to.have.members(["John"]);
    expect(search.get("age")).to.have.members(["20"]);
    expect(search.value).to.equal("name=John&age=20");
  });

  it("should set and get query parameters using object syntax", () => {
    const { result } = renderHook(() => useUrlState(), {
      wrapper: UrlStateProvider,
    });

    const { search } = result.current;
    search.set.record({ name: "John", age: "20" });

    expect(search.get("name")).to.have.members(["John"]);
    expect(search.get("age")).to.have.members(["20"]);
  });

  it("should remove query parameters", () => {
    const { result } = renderHook(() => useUrlState(), {
      wrapper: UrlStateProvider,
    });
    const { search } = result.current;

    search.set("name", "John");
    search.remove("name");

    expect(search.get("name")).to.have.members([]);
  });

  it("should get query parameters with fallback values", () => {
    const { result } = renderHook(() => useUrlState(), {
      wrapper: UrlStateProvider,
    });
    const { search } = result.current;

    expect(search.get("name", "John")).to.have.members(["John"]);
    expect(search.get("age", "20")).to.have.members(["20"]);
  });

  it("should get query parameters with type casting", () => {
    const { result } = renderHook(() => useUrlState(), {
      wrapper: UrlStateProvider,
    });

    const { search } = result.current;
    search.set("age", "20");

    expect(search.get.number("age")).to.have.members([20]);
    expect(search.get.boolean("age")).to.have.members([true]);
    expect(search.get.parse<number>("age")).to.have.members([20]);
  });

  it("should parse query parameters", () => {
    const { result } = renderHook(
      () =>
        useUrlState({
          reviver: (key: string, value: unknown) => {
            if (typeof value === "string") return value.toUpperCase();
          },
        }),
      {
        wrapper: UrlStateProvider,
      }
    );

    const { search } = result.current;
    search.set.stringify("name", "john");

    expect(search.get.parse("name", "john")).to.have.members(["JOHN"]);
    expect(search.get.number("age", 20)).to.have.members([20]);

    search.set("age", "56");
    expect(search.get.number("age")).to.have.members([56]);
  });

  it("should encode query parameters", () => {
    const { result } = renderHook(() => useUrlState(), {
      wrapper: UrlStateProvider,
    });

    const { search } = result.current;
    search.set.encode("name", "John Doe");

    expect(search.get("name")).to.have.members(["John%20Doe"]);
  });

  it("should stringify query parameters", () => {
    const { result } = renderHook(() => useUrlState(), {
      wrapper: UrlStateProvider,
    });

    const { search } = result.current;
    search.set.stringify("name", { first: "John", last: "Doe" });

    expect(search.get("name")).to.have.members([
      '{"first":"John","last":"Doe"}',
    ]);

    search.remove("name");
    search.set.encode("name", JSON.stringify({ first: "John", last: "Doe" }));

    expect(search.get("name")).to.have.members([
      "%7B%22first%22%3A%22John%22%2C%22last%22%3A%22Doe%22%7D",
    ]);

    const [name] = search.get.decode("name");
    expect(name).deep.equal({
      first: "John",
      last: "Doe",
    });
  });

  it("should set and get hash parameters", () => {
    const { result } = renderHook(() => useUrlState(), {
      wrapper: UrlStateProvider,
    });

    const { hash } = result.current;
    hash.set("name", "John");

    expect(hash.get("name")).to.have.members(["John"]);
  });
});
