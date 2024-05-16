import { describe, expect, it } from "vitest";
import { reverseList } from "./reverseList";

describe("reverseList", () => {
  it("should return an empty object if the input configuration is empty", () => {
    const configuration = {};
    const result = reverseList(configuration);
    expect(result).toEqual({});
  });

  it("should reverse the keys and values in the configuration object", () => {
    const configuration = {
      key1: ["value1", "value2"],
      key2: ["value3"],
      key3: ["value4", "value5", "value6"],
    };
    const result = reverseList(configuration);
    expect(result).toEqual({
      value1: "key1",
      value2: "key1",
      value3: "key2",
      value4: "key3",
      value5: "key3",
      value6: "key3",
    });
  });

  it("should handle duplicate values in the configuration object", () => {
    const configuration = {
      key1: ["value1", "value2"],
      key2: ["value2", "value3"],
    };
    const result = reverseList(configuration);
    expect(result).toEqual({
      value1: "key1",
      value2: "key2",
      value3: "key2",
    });
  });
});
