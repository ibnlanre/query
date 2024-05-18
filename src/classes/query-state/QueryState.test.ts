import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryState } from "./QueryState";

describe("QueryState", () => {
  const mockContext = {
    setRule: {},
    getRule: {},
    encode: vi.fn((value) => value),
    decode: vi.fn((value) => value),
    parse: vi.fn((value) => value),
    stringify: vi.fn((value) => value),
    reviver: vi.fn(),
    replacer: vi.fn(),
    debug: false,
    push: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize params and context", () => {
      const query = "key1=value1&key2=value2";
      const queryState = new QueryState(query, mockContext);

      expect(queryState["params"]).toBeInstanceOf(URLSearchParams);
      expect(queryState["params"].toString()).toBe(query);
      expect(queryState["context"]).toBe(mockContext);
    });
  });

  describe("encode", () => {
    it("should call the encode method of the context", () => {
      const queryState = new QueryState("", mockContext);
      const value = "test";

      queryState["encode"](value);
      expect(mockContext.encode).toHaveBeenCalledWith(value);
    });

    it("should return the encoded value", () => {
      const queryState = new QueryState("", mockContext);
      const value = "test";
      const encodedValue = "encoded-test";
      mockContext.encode.mockReturnValue(encodedValue);

      const result = queryState["encode"](value);

      expect(result).toBe(encodedValue);
    });

    it("should log error and return the original value if an error occurs", () => {
      const queryState = new QueryState("", mockContext);
      const value = "test";
      const error = new Error("Encoding error");
      mockContext.encode.mockImplementation(() => {
        throw error;
      });

      const result = queryState["encode"](value);

      expect(mockContext.encode).toHaveBeenCalledWith(value);
      expect(console.error).toHaveBeenCalledWith(error);
      expect(result).toBe(value);
    });
  });

  // Add more test cases for other methods

  describe.todo("setValue", () => {
    // Test cases for setValue method
  });

  describe.todo("getValue", () => {
    // Test cases for getValue method
  });

  describe.todo("has", () => {
    // Test cases for has method
  });

  describe.todo("remove", () => {
    // Test cases for remove method
  });

  // Add more test cases for other methods
});
