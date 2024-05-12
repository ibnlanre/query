import { assign } from "@/assign";
import { BaseState } from "../base-state";
import { QueryState } from "../query-state";

import type { Arbitrary, UrlStateContext } from "@/types";

function pushState(href: string) {
  const data = { ...self.history.state, as: href, url: href };
  self.history.replaceState(data, "", href);
}

const defaults = {
  debug: false,
  encode: encodeURIComponent,
  decode: decodeURIComponent,
  stringify: JSON.stringify,
  parse: JSON.parse,
  push: pushState,
} satisfies UrlStateContext;

function mergeContext(
  original: UrlStateContext,
  context?: Partial<UrlStateContext>
): UrlStateContext {
  return assign(original, context);
}

export class UrlState<QueryKey extends Arbitrary> {
  /**
   * The base URL of the current browsing context.
   */
  static base = self.location.href;

  /**
   * The number of entries in the history of the current browsing context.
   */
  static history = self.history.length;

  private model: URL;
  private context: UrlStateContext;

  constructor(
    href: string = UrlState.base,
    context?: Partial<UrlStateContext>
  ) {
    this.model = new URL(href);
    this.context = mergeContext(defaults, context);
  }

  public get url() {
    return new BaseState(this.model);
  }

  private get searchContext() {
    return mergeContext(this.context, {
      push: (href: string) => {
        this.model.search = href;
        pushState(this.model.href);
      },
    });
  }

  public get search() {
    return new QueryState<QueryKey>(this.url.query, this.searchContext);
  }

  private get hashContext() {
    return mergeContext(this.context, {
      push: (href: string) => {
        this.model.hash = href;
        pushState(this.model.href);
      },
    });
  }

  public get hash() {
    return new QueryState<QueryKey>(this.url.fragment, this.hashContext);
  }
}
