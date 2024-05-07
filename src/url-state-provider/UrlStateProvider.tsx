import { createContext, PropsWithChildren } from "react";

function pushState(query: string) {
  const url = new URL(self.location.href);
  url.search = query;
  self.history.pushState({}, "", url);
}

export const urlStateContext = createContext<UrlStateProviderConfiguration>({});

type Reviver<T> = (value: string) => T;
type Replacer<T> = (key: string, value: T) => T;

type Stringify = <T>(value: T, replacer?: Replacer<T>) => string;
type Parse = <T>(value: string, reviver?: Reviver<T>) => T;

type Encode = (value: string) => string;
type Decode = (value: string) => string;
type Push = (query: string) => void;

export type UrlStateProviderConfiguration = {
  reviver?: Reviver<unknown>;
  replacer?: Replacer<unknown>;
  parse?: Parse;
  stringify?: Stringify;
  encode?: Encode;
  decode?: Decode;
  push?: Push;
};

type UrlStateProviderProps = PropsWithChildren<UrlStateProviderConfiguration>;

export function UrlStateProvider({
  children,
  ...configuration
}: UrlStateProviderProps) {
  const defaults = {
    encode: encodeURIComponent,
    decode: decodeURIComponent,
    stringify: JSON.stringify,
    parse: JSON.parse,
    push: pushState,
  };
  const value = Object.assign(defaults, configuration);

  return (
    <urlStateContext.Provider value={value}>
      {children}
    </urlStateContext.Provider>
  );
}
