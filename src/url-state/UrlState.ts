import { BaseState } from "./BaseState";
import { QueryState } from "./QueryState";

import type { Arbitrary, UrlStateContext } from "../types";

function pushState(href: string) {
  self.history.pushState({}, "", href);
}

const defaults = {
  debug: false,
  encode: encodeURIComponent,
  decode: decodeURIComponent,
  stringify: JSON.stringify,
  parse: JSON.parse,
  push: pushState,
} satisfies UrlStateContext;

function mergeContext(context: Partial<UrlStateContext>): UrlStateContext {
  return Object.assign(defaults, context);
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
    this.context = Object.assign(defaults, context);
  }

  public get url() {
    return new BaseState(this.model);
  }

  private get searchContext() {
    return mergeContext({
      push: (href: string) => {
        this.model.search = href;
        location.replace(this.model.href);
        self.history.pushState({}, "", location.href);
      },
    });
  }

  public get search() {
    return new QueryState<QueryKey>(this.url.query, this.searchContext);
  }

  public get hash() {
    return new QueryState<QueryKey>(this.url.fragment, this.context);
  }
}
