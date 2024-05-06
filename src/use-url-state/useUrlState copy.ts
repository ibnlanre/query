import { useContext, useMemo } from "react";

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

  const params = useMemo(() => new URLSearchParams(self.location.search), []);

  const override = (key: Key, value: Argument) => {
    if (value === null || value === undefined) params.delete(key);
    else params.set(key, value);
  };

  function set(query: Key, value: Argument) {
    override(query, value);
    context.push(search.value);
  }

  const setters = useMemo(
    () => ({
      record(query: Query) {
        for (const key in query) override(key, query[key]);
      },
      encode<T>(key: Key, value: T) {
        set(key, encoder(value));
      },
      stringify<T>(key: Key, options: Stringify<T>) {
        const { value, replacer } = { ...options };
        set(key, JSON.stringify(value, replacer));
      },
    }),
    []
  );

  function get<T extends string>(key: Key, fallback = ""): T {
    return (params.get(key) ?? fallback) as T;
  }

  const getters = useMemo(
    () => ({
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
      parse<T>(key: Key, options?: Parse<T>) {
        const { fallback = "", reviver = JSON.parse } = { ...options };
        return reviver(search.get(key, String(fallback)));
      },
      decode<T>(key: Key, fallback?: T) {
        return decoder(search.get(key), fallback) as T;
      },
    }),
    []
  );

  const search = useMemo(
    () => ({
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
    }),
    []
  );

  return search;
}
