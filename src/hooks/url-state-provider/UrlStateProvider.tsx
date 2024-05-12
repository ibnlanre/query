import type { UrlStateContext } from "@/types";
import { createContext, PropsWithChildren } from "react";

export const urlStateContext = createContext<Partial<UrlStateContext>>(
  undefined as unknown as UrlStateContext
);

export type UrlStateProviderProps = PropsWithChildren<Partial<UrlStateContext>>;

export function UrlStateProvider({
  children,
  ...configuration
}: UrlStateProviderProps) {
  return (
    <urlStateContext.Provider value={{ ...configuration }}>
      {children}
    </urlStateContext.Provider>
  );
}
