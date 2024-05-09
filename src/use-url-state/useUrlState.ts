import { useContext, useMemo } from "react";

import { Arbitrary, UrlStateContext } from "../types";
import { UrlState } from "../url-state";
import { urlStateContext } from "../url-state-provider";

export function useUrlState<Marker extends string>(
  configuration?: Partial<UrlStateContext>
) {
  const context = useContext(urlStateContext);

  const urlState = useMemo(() => {
    const message = "useUrlState must be used within a UrlStateProvider";
    if (!context) throw new Error(message);

    return new UrlState<Arbitrary<Marker>>(
      self.location.href,
      Object.assign(context, configuration)
    );
  }, [context]);

  return urlState;
}
