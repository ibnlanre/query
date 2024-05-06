import { useContext, useState } from "react";

import {
  urlStateContext,
  type UrlStateProviderConfiguration,
} from "../url-state-provider";

type Nullish = null | undefined;
type Argument = string | Nullish;

type Replacer<T> = (key: string, value: T) => T;
type Reviver<T> = (value: string) => T;

type Parse<T> = { fallback?: T; reviver?: Reviver<T> };
type Stringify<T> = { value: T; replacer?: Replacer<T> };

function decoder<T>(value: string, fallback?: T) {
  try {
    const decoded = decodeURIComponent(value);
    return JSON.parse(decoded) as T;
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

function encoder<T>(value: T, replacer?: Replacer<T>) {
  try {
    const stringified = JSON.stringify(value, replacer);
    return encodeURIComponent(stringified);
  } catch (error) {
    console.error(error);
    return "";
  }
}
class UrlState<Key extends string, Query extends { [k in Key]: Argument }> {
  private params: URLSearchParams;
  private context: Required<UrlStateProviderConfiguration>;

  constructor(context: Required<UrlStateProviderConfiguration>) {
    this.params = new URLSearchParams(self.location.search);
    this.context = context;
  }

  private setValue(key: Key, value: Argument) {
    switch (value) {
      case undefined:
      case null:
      case "":
        this.params.delete(key);
        break;
      default:
        this.params.set(key, value);
    }
  }

  private getValue<T>(key: Key): T {
    if (!this.params.has(key)) return null as T;
    return this.params.get(key) as T;
  }

  public set(query: Key, value: Argument) {
    this.setValue(query, value);
    this.context.push(this.search.value);
  }

  private setters = {
    record: (query: Query) => {
      for (const key in query) this.setValue(key, query[key]);
    },
    encode: <T>(key: Key, value: T) => {
      this.set(key, encoder(value));
    },
    stringify: <T>(key: Key, options: Stringify<T>) => {
      const { value, replacer } = { ...options };
      this.set(key, JSON.stringify(value, replacer));
    },
  };

  public get<T>(key: Key, fallback?: T) {
    return this.getValue<T>(key) ?? (fallback as T);
  }

  private getters = {
    number(key: Key, fallback?: number) {
      if (!this.params.has(key)) return fallback;
      else return Number(this.params.get(key));
    },
    boolean(key: Key, fallback?: boolean) {
      if (!this.params.has(key)) return fallback;
      else return Boolean(this.params.get(key));
    },
    date(key: Key, fallback?: Date) {
      if (!this.params.has(key)) return fallback;
      return new Date(this.params.get(key));
    },
    timestamp(key: Key, fallback?: number) {
      if (!this.params.has(key)) return fallback;
      return new Date(this.params.get(key)).getTime();
    },
    parse<T>(key: Key, options?: Parse<T>) {
      const { fallback = "", reviver = JSON.parse } = { ...options };
      return reviver(this.params.get(key, String(fallback)));
    },
    decode<T>(key: Key, fallback?: T) {
      return decoder(this.params.get(key), fallback) as T;
    },
  };

  public search = {
    get value() {
      return this.params.toString();
    },
    get entries() {
      return Object.fromEntries(this.params.entries());
    },
    remove: (key: Key) => {
      this.params.delete(key);
      this.context.push(this.search.value);
    },
    set: Object.assign(this.set, this.setters),
    get: Object.assign(this.get, this.getters),
    has: (key: Key) => this.params.has(key),
  };
}

export function useUrlState<K extends string>() {
  const context = useContext(
    urlStateContext
  ) as Required<UrlStateProviderConfiguration>;

  type Key = K | (string & {});
  type Query = { [k in Key]: Argument };

  const [search] = useState(() => new UrlState<Key, Query>(context));
}
