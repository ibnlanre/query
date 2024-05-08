import { createContext, PropsWithChildren } from "react";

function pushState(query: string) {
  const url = new URL(self.location.href);
  url.search = query;
  self.history.pushState({}, "", url);
}

export type Reviver<T> = (value: string) => T;
export type Replacer<T> = (key: string, value: T) => T;

export type Stringify = <T>(value: T, replacer?: Replacer<T>) => string;
export type Parse = <T>(value: string, reviver?: Reviver<T>) => T;

export type Encode = (value: string) => string;
export type Decode = (value: string) => string;
export type Push = (query: string) => void;

export type UrlStateProviderConfiguration = {
  reviver?: Reviver<unknown>;
  replacer?: Replacer<unknown>;
  parse: Parse;
  stringify: Stringify;
  encode: Encode;
  decode: Decode;
  push: Push;
};

const defaults = {
  encode: encodeURIComponent,
  decode: decodeURIComponent,
  stringify: JSON.stringify,
  parse: JSON.parse,
  push: pushState,
} satisfies UrlStateProviderConfiguration;

export const urlStateContext =
  createContext<UrlStateProviderConfiguration>(defaults);

type UrlStateProviderProps = PropsWithChildren<
  Partial<UrlStateProviderConfiguration>
>;

export function UrlStateProvider({
  children,
  ...configuration
}: UrlStateProviderProps) {
  const value = Object.assign(
    defaults,
    configuration
  ) as Required<UrlStateProviderConfiguration>;

  return (
    <urlStateContext.Provider value={value}>
      {children}
    </urlStateContext.Provider>
  );
}
