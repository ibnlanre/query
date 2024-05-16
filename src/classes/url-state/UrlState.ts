import { mergeContext, pushState } from "@/functions";

import { BaseState } from "../base-state";
import { QueryState } from "../query-state";

import type { Arbitrary, UrlStateContext } from "@/types";

const defaults = {
  debug: false,
  encode: encodeURIComponent,
  decode: decodeURIComponent,
  stringify: JSON.stringify,
  parse: JSON.parse,
  push: pushState,
  setRule: {},
  getRule: {},
} satisfies UrlStateContext;

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
      push: (query: string) => {
        this.model.search = query;
        pushState(this.model.href);
      },
    });
  }

  public get search() {
    return new QueryState<QueryKey>(this.url.query, this.searchContext);
  }

  private get hashContext() {
    return mergeContext(this.context, {
      push: (query: string) => {
        this.model.hash = query;
        pushState(this.model.href);
      },
    });
  }

  public get hash() {
    return new QueryState<QueryKey>(this.url.fragment, this.hashContext);
  }
}
