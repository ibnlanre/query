import { useContext, useState } from "react";

import {
  urlStateContext,
  type UrlStateProviderConfiguration,
} from "../url-state-provider";

type Nullish = null | undefined;

function isNullish(value: unknown): value is Nullish {
  return value === null || value === undefined;
}

type Arbitrary = string | (string & {});

class UrlState<QueryKey extends Arbitrary> {
  private params: URLSearchParams;
  private context: Required<UrlStateProviderConfiguration>;

  constructor(context: Required<UrlStateProviderConfiguration>) {
    this.params = new URLSearchParams(self.location.search);
    this.context = context;
  }

  private encode<T>(value: T, replacer?: (key: string, value: T) => T) {
    try {
      const stringified = this.context.stringify(value, replacer);
      return encodeURIComponent(stringified);
    } catch (error) {
      console.error(error);
    }
  }

  private decode<T>(value: string, reviver?: (value: string) => T) {
    try {
      const decoded = this.context.decode(value);
      return this.context.parse(decoded, reviver) as T;
    } catch (error) {
      console.error(error);
    }
  }

  private resolve<T>(fallback?: T) {
    if (!isNullish(fallback)) return [fallback];
    return [];
  }

  private setValue(key: QueryKey, value: string | Nullish) {
    if (value) this.params.append(key, value);
  }

  private setter(key: QueryKey, value: string | Nullish) {
    this.setValue(key, value);
    this.context.push(this.value);
  }

  private setters = {
    record: (query: Partial<Record<QueryKey, string | Nullish>>) => {
      for (const key in query) this.setValue(key, query[key]);
    },
    encode: <T>(key: QueryKey, value: T) => {
      this.setValue(key, this.encode(value));
    },
    stringify: <T>(key: QueryKey, value: T) => {
      this.setValue(key, JSON.stringify(value));
    },
  };

  private getValue(key: QueryKey) {
    return this.params.getAll(key);
  }

  private getter(key: QueryKey, fallback?: string) {
    const value = this.getValue(key);
    if (value.length) return value;
    else return this.resolve(fallback);
  }

  private getters = {
    number: (key: QueryKey, fallback?: number) => {
      const value = this.getValue(key);
      if (value.length) return value.map(Number);
      else return this.resolve(fallback);
    },
    boolean: (key: QueryKey, fallback?: boolean) => {
      const value = this.getValue(key);
      if (value.length) return value.map(Boolean);
      else return this.resolve(fallback);
    },
    date: (key: QueryKey, fallback?: string) => {
      const value = this.getValue(key);
      if (value.length) {
        return value.map((date) => new Date(date).toISOString());
      } else return this.resolve(fallback);
    },
    timestamp: (key: QueryKey, fallback?: number) => {
      const value = this.getValue(key);
      if (value.length) {
        return value.map((date) => new Date(date).getTime());
      } else return this.resolve(fallback);
    },
    parse: <T>(key: QueryKey, fallback?: T) => {
      const value = this.getValue(key);
      if (value.length) {
        return value.map((item) => this.context.parse(item));
      } else return this.resolve(fallback);
    },
    decode: <T>(key: QueryKey, fallback?: T) => {
      const value = this.getValue(key);
      if (value.length) {
        return value.map((item) => this.decode(item));
      } else return this.resolve(fallback);
    },
  };

  get value() {
    return this.params.toString();
  }

  get entries() {
    return Object.fromEntries(this.params.entries());
  }

  public remove(key: QueryKey) {
    this.params.delete(key);
    this.context.push(this.value);
  }

  public set = Object.assign(this.setter, this.setters);
  public get = Object.assign(this.getter, this.getters);
  public has(key: QueryKey) {
    return this.params.has(key);
  }
}

export function useUrlState<Marker extends string>(
  configuration?: UrlStateProviderConfiguration
) {
  const context = useContext(urlStateContext);
  const contextSpecificConfiguration = Object.assign(
    context,
    configuration
  ) as Required<UrlStateProviderConfiguration>;

  type QueryKey = Marker | (string & {});
  const [urlState] = useState(() => {
    return new UrlState<QueryKey>(contextSpecificConfiguration);
  });

  return urlState;
}
