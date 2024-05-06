import { createContext, PropsWithChildren } from "react";

function pushState(query: string) {
  const url = new URL(self.location.href);
  url.search = query;
  self.history.pushState({}, "", url);
}

export const urlStateContext = createContext<UrlStateProviderConfiguration>({});

export type UrlStateProviderConfiguration = {
  parse?: <T>(value: string) => T;
  stringify?: <T>(value: T) => string;
  encode?: (value: string) => string;
  decode?: (value: string) => string;
  push?: (query: string) => void;
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
