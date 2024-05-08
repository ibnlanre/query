import { useContext, useMemo } from "react";

import { UrlState } from "../url-state";
import {
  urlStateContext,
  type UrlStateProviderConfiguration,
} from "../url-state-provider";

export function useUrlState<Marker extends string>(
  configuration?: Partial<UrlStateProviderConfiguration>
) {
  const context = useContext(urlStateContext);
  type QueryKey = Marker | (string & {});

  const urlState = useMemo(() => {
    const message = "useUrlState must be used within a UrlStateProvider";
    if (!context) throw new Error(message);

    const contextSpecificConfiguration = Object.assign(context, configuration);
    return new UrlState<QueryKey>(contextSpecificConfiguration);
  }, [context]);

  return urlState;
}
