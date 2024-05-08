import { createContext, PropsWithChildren } from "react";

function pushState(query: string) {
  const url = new URL(self.location.href);
  url.search = query;
  self.history.pushState({}, "", url);
}

export type This = ThisType<unknown>;
export type Reviver = (this: This, key: string, value: unknown) => unknown;
export type Replacer = (this: This, key: string, value: unknown) => unknown;

export type Stringify = <T>(value: T, replacer?: Replacer) => string;
export type Parse = <T>(value: string, reviver?: Reviver) => T;

export type Encode = (value: string) => string;
export type Decode = (value: string) => string;
export type Push = (query: string) => void;

export type UrlStateProviderConfiguration = {
  reviver?: Reviver;
  replacer?: Replacer;
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

export const urlStateContext = createContext<UrlStateProviderConfiguration>(
  undefined as unknown as UrlStateProviderConfiguration
);

export type UrlStateProviderProps = PropsWithChildren<
  Partial<UrlStateProviderConfiguration>
>;

export function UrlStateProvider({
  children,
  ...configuration
}: UrlStateProviderProps) {
  const value = Object.assign(
    { ...defaults },
    configuration
  ) as Required<UrlStateProviderConfiguration>;

  return (
    <urlStateContext.Provider value={value}>
      {children}
    </urlStateContext.Provider>
  );
}
