import { useContext, useMemo } from "react";

import { assign } from "@/assign";
import { UrlState } from "@/classes";
import { Arbitrary, UrlStateContext } from "@/types";
import { urlStateContext } from "../url-state-provider";

export function useUrlState<Marker extends string>(
  configuration?: Partial<UrlStateContext>
) {
  const context = useContext(urlStateContext);

  const state = useMemo(() => {
    const message = "useUrlState must be used within a UrlStateProvider";
    if (!context) throw new Error(message);

    return new UrlState<Arbitrary<Marker>>(
      self.location.href,
      assign(context, configuration)
    );
  }, [context]);

  return state;
}
