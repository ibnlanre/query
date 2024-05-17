import { createContext, useContext, useMemo, useState } from "react";

import { UrlState } from "@/classes";
import { assign } from "@/functions";

import type { Arbitrary, UrlStateContext } from "@/types";
import type { PropsWithChildren } from "react";

export function createUrlStateProvider<Marker extends string>(
  configuration: Partial<UrlStateContext<Marker>>
) {
  const UrlStateContext = createContext<Partial<UrlStateContext<Marker>>>(
    undefined as unknown as UrlStateContext<Marker>
  );

  function UrlStateProvider({ children }: PropsWithChildren<{}>) {
    return (
      <UrlStateContext.Provider value={configuration}>
        {children}
      </UrlStateContext.Provider>
    );
  }

  function useUrlState(configuration?: Partial<UrlStateContext<Marker>>) {
    const context = useContext(UrlStateContext);

    const state = useMemo(() => {
      if (!context) {
        const message = "useUrlState must be used within a UrlStateProvider";
        throw new Error(message);
      }

      return new UrlState<Arbitrary<Marker>>(
        UrlState.base,
        assign(context, configuration)
      );
    }, [context]);

    return state;
  }

  return { UrlStateProvider, useUrlState };
}

const { UrlStateProvider, useUrlState } = createUrlStateProvider({
  encode: (value: string) => encodeURIComponent(value),
  setRule: {
    stringify: ["nicks", "join"],
    encode: ["q"],
  },
  getRule: {
    parse: ["nicks", "join"],
    datetime: ["date"],
    decode: ["q"],
  },
});

function App() {
  return (
    <UrlStateProvider>
      <Component />
    </UrlStateProvider>
  );
}

function Component() {
  const { search, hash } = useUrlState();
  const [name, setName] = useState<string>();
  hash.set.encode("nicks", ["a", "b", "c"]);
  const [val] = search.get<"L">("q");

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={() => search.set("q", name)}>Search</button>
    </div>
  );
}
