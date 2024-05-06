import { useContext } from "react";

import {
  urlStateContext,
  type UrlStateProviderConfiguration,
} from "../url-state-provider";

type Nullish = null | undefined;

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

export function useUrlState<K extends string = string & {}>() {
  type Key = K | (string & {});
  type Argument = string | Nullish;
  type Query = { [k in Key]: Argument };

  const context = useContext(
    urlStateContext
  ) as Required<UrlStateProviderConfiguration>;

  const params = new URLSearchParams(self.location.search);
  const setValue = (key: Key, value: Argument) => {
    switch (value) {
      case undefined:
      case null:
      case "":
        params.delete(key);
        break;
      default:
        params.set(key, value);
    }
  };
  const getValue = <T>(key: Key): T => {
    if (!params.has(key)) return null as T;
    return params.get(key) as T;
  };

  function set(query: Key, value: Argument) {
    setValue(query, value);
    context.push(search.value);
  }

  const setters = {
    record(query: Query) {
      for (const key in query) setValue(key, query[key]);
    },
    encode<T>(key: Key, value: T) {
      set(key, encoder(value));
    },
    stringify<T>(key: Key, options: Stringify<T>) {
      const { value, replacer } = { ...options };
      set(key, JSON.stringify(value, replacer));
    },
  };

  function get<T>(key: Key, fallback?: T) {
    return getValue<T>(key) ?? (fallback as T);
  }

  const getters = {
    number(key: Key, fallback?: number) {
      if (!search.has(key)) return fallback;
      else return Number(search.get(key));
    },
    boolean(key: Key, fallback?: boolean) {
      if (!search.has(key)) return fallback;
      else return Boolean(search.get(key));
    },
    date(key: Key, fallback?: Date) {
      if (!search.has(key)) return fallback;
      return new Date(search.get(key));
    },
    timestamp(key: Key, fallback?: number) {
      if (!search.has(key)) return fallback;
      return new Date(search.get(key)).getTime();
    },
    parse<T>(key: Key, options?: Parse<T>) {
      const { fallback = "", reviver = JSON.parse } = { ...options };
      return reviver(search.get(key, String(fallback)));
    },
    decode<T>(key: Key, fallback?: T) {
      return decoder(search.get(key), fallback) as T;
    },
  };

  const search = {
    get value() {
      return params.toString();
    },
    get entries() {
      return Object.fromEntries(params.entries());
    },
    remove: (key: Key) => {
      params.delete(key);
      context.push(search.value);
    },
    set: Object.assign(set, setters),
    get: Object.assign(get, getters),
    has: (key: Key) => params.has(key),
  };

  return search;
}
