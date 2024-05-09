import { isDefined, type Nullish } from "../guards";
import type {
  Arbitrary,
  RecordValue,
  Replacer,
  Reviver,
  UrlStateContext,
} from "../types";

export class QueryState<QueryKey extends Arbitrary> {
  /**
   * @param params - URLSearchParams object
   *
   * @description This method works as follows:
   * - It stores query parameters from the URL as a URLSearchParams object.
   * - Any changes made to the query parameters are reflected in the URLSearchParams object.
   * - The URLSearchParams object is then used to update the URL.
   * - The URL is updated using the push method from the context.
   */
  protected params: URLSearchParams;

  /**
   * @param context - UrlStateContext object
   *
   * @description This method works as follows:
   * - It stores the configuration object from the context.
   * - The configuration object is used to encode and decode values.
   * - The configuration object is used to parse and stringify values.
   * - The configuration object is used to update the URL.
   */
  private context: UrlStateContext;

  constructor(
    query: string,
    context: UrlStateContext,
    modifier?: Partial<UrlStateContext>
  ) {
    this.params = new URLSearchParams(query);
    this.context = Object.assign(context, modifier);
  }

  /**
   * @param value - Value to be encoded
   * @param replacer - Replacer function
   *
   * @description This method works as follows:
   * - It encodes the value using the context's encode method.
   * - It returns the encoded value.
   * - If an error occurs, it logs the error to the console.
   * - It returns `undefined` if an error occurs.
   */
  private encode = <Value>(value: Value, replacer?: Replacer) => {
    try {
      const stringified = this.context.stringify(value, replacer);
      return encodeURIComponent(stringified);
    } catch (error) {
      if (this.context.debug) console.error(error);
    }
  };

  /**
   * @param value - Value to be decoded
   * @param reviver - Reviver function
   *
   * @description This method works as follows:
   * - It decodes the value using the context's decode method.
   * - It parses the decoded value using the context's parse method.
   * - It returns the parsed value.
   * - If an error occurs, it logs the error to the console.
   * - It returns `undefined` if an error occurs.
   */
  private decode = <Value>(value: string, reviver?: Reviver) => {
    try {
      const decoded = this.context.decode(value);
      return this.context.parse(decoded, reviver) as Value;
    } catch (error) {
      if (this.context.debug) console.error(error);
      return undefined as Value;
    }
  };

  /**
   * @param value - Value to be parsed
   *
   * @description This method works as follows:
   * - It parses the value using the context's parse method.
   * - It returns the parsed value.
   * - If an error occurs, it logs the error to the console.
   * - It returns `undefined` if an error occurs.
   */
  private parse = <Value>(value: string) => {
    try {
      const parsedValue = this.context.parse<Value>(
        value,
        this.context.reviver
      );
      return parsedValue;
    } catch (error) {
      if (this.context.debug) console.error(error);
      return undefined as Value;
    }
  };

  /**
   * @param value - Value to be stringified
   *
   * @description This method works as follows:
   * - It stringifies the value using the context's stringify method.
   * - It returns the stringified value.
   * - If an error occurs, it logs the error to the console.
   * - It returns `undefined` if an error occurs.
   */
  private stringify = <Value>(value: Value) => {
    try {
      const stringifiedValue = this.context.stringify(
        value,
        this.context.replacer
      );
      return stringifiedValue;
    } catch (error) {
      if (this.context.debug) console.error(error);
      return "";
    }
  };

  /**
   * @param value - Value to be converted to a datetime string
   *
   * @description This method works as follows:
   * - It converts the value to a datetime string.
   * - It returns the datetime string.
   */
  private datetime = (value: string) => {
    return new Date(value).toISOString();
  };

  /**
   * @param value - Value to be converted to a timestamp
   *
   * @description This method works as follows:
   * - It converts the value to a timestamp.
   * - It returns the timestamp.
   */
  private timestamp = (value: string) => {
    return new Date(value).getTime();
  };

  /**
   * @param key - Query key
   * @param transformer - Transformer function
   * @param fallback - Fallback value
   *
   * @description This method works as follows:
   * - It resolves the value of the query key using the transformer function.
   * - It returns the resolved value.
   * - If the resolved value is empty, it returns the fallback value.
   */
  private resolve = <Value>(
    key: string,
    transformer: (value: string) => Value,
    fallback?: Value
  ) => {
    const value = this.params.getAll(key);
    return value.length
      ? value.map(transformer).filter(isDefined)
      : [fallback].filter(isDefined);
  };

  /**
   * @param key - Query key
   * @param value - Query value
   *
   * @description This method works as follows:
   * - It sets the value of the query key.
   * - It appends the value to the URLSearchParams object.
   * - It pushes the updated URL to the context.
   * - If the value is empty, it does not append the value to the URLSearchParams object.
   * - If the value is empty, it does not push the updated URL to the context.
   */
  private setValue = (key: QueryKey, value: string | Nullish, push = true) => {
    if (isDefined(value)) {
      this.params.append(key, value);
      if (push) this.context.push(this.value);
    }
  };

  private include = (key: QueryKey, value: string | Nullish) => {
    this.setValue(key, value, false);
  };

  private record = (key: QueryKey, value: RecordValue) => {
    if (Array.isArray(value)) {
      value.forEach((item) => this.include(key, item));
    } else this.include(key, value);
  };

  private setters = {
    /**
     * @param query - Query object
     *
     * @description This method works as follows:
     * - It takes a query object as an argument.
     * - It appends the values to the URLSearchParams object.
     * - It pushes the updated URL to the context.
     * - If the value is empty, it does not append the value to the URLSearchParams object.
     * - If the value is empty, it does not push the updated URL to the context.
     */
    record: (query: Partial<Record<QueryKey, RecordValue>>) => {
      const keys = Object.keys(query) as QueryKey[];
      for (const key of keys) this.record(key, query[key]);
      if (keys.length) this.context.push(this.value);
    },
    encode: <Value>(key: QueryKey, value: Value) => {
      this.setValue(key, this.encode(value));
    },
    stringify: <Value>(key: QueryKey, value: Value) => {
      this.setValue(key, this.stringify(value));
    },
  };

  private getValue = (key: QueryKey, fallback?: string) => {
    return this.resolve(key, (value) => value, fallback);
  };

  private getters = {
    parse: <Value>(key: QueryKey, fallback?: Value) => {
      return this.resolve<Value>(key, this.parse, fallback);
    },
    decode: <Value>(key: QueryKey, fallback?: Value) => {
      return this.resolve<Value>(key, this.decode, fallback);
    },
    number: (key: QueryKey, fallback?: number) => {
      return this.resolve(key, Number, fallback);
    },
    datetime: (key: QueryKey, fallback?: string) => {
      return this.resolve(key, this.datetime, fallback);
    },
    timestamp: (key: QueryKey, fallback?: number) => {
      return this.resolve(key, this.timestamp, fallback);
    },
    boolean: (key: QueryKey, fallback?: boolean) => {
      return this.resolve(key, Boolean, fallback);
    },
  };

  public get value() {
    return this.params.toString();
  }

  public get entries() {
    return Object.fromEntries(this.params.entries());
  }

  public remove = (key: QueryKey) => {
    this.params.delete(key);
    this.context.push(this.value);
  };

  /**
   * Adds a query parameter to the URL.
   *
   * @param key - Query key
   * @param value - Query value
   *
   * @returns {void}
   *
   * @summary If the value is empty:
   * - It does not append the value to the URLSearchParams object.
   * - It does not push the updated URL to the context.
   */
  public set = Object.assign(this.setValue, this.setters);

  /**
   * Returns the values of the query key.
   *
   * @param key - Query key
   * @param fallback - Fallback value
   *
   * @returns {string[]} The values of the query key.
   *
   * @summary If the value is empty:
   * - It returns the fallback value if it is provided.
   * - It returns an empty array if the fallback value is not provided.
   */
  public get = Object.assign(this.getValue, this.getters);

  /**
   * @param key - Query key
   *
   * @description This method works as follows:
   * - It checks if the query key exists in the URLSearchParams object.
   * - It returns `true` if the query key exists in the URLSearchParams object.
   * - It returns `false` if the query key does not exist in the URLSearchParams object.
   */
  public has = (key: QueryKey) => this.params.has(key);
}
