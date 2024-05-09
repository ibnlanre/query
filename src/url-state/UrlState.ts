import { BaseState } from "./BaseState";
import { QueryState } from "./QueryState";

import type { Arbitrary, UrlStateContext } from "../types";

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
  private pushState = (href: string) => {
    self.history.pushState({}, "", href);
  };

  constructor(
    href: string = UrlState.base,
    context?: Partial<UrlStateContext>
  ) {
    const defaults = {
      debug: false,
      encode: encodeURIComponent,
      decode: decodeURIComponent,
      stringify: JSON.stringify,
      parse: JSON.parse,
      push: this.pushState,
    } satisfies UrlStateContext;

    this.context = Object.assign(defaults, context);
    this.model = new URL(href);
  }

  public get url() {
    return new BaseState(this.model);
  }

  public get search() {
    return new QueryState<QueryKey>(this.url.query, this.context, {
      push: (query: string) => {
        this.model.search = query;
        this.context.push(this.model.href);
      },
    });
  }

  public get hash() {
    return new QueryState<QueryKey>(this.url.fragment, this.context, {
      push: (query: string) => {
        this.model.hash = query;
        this.context.push(this.model.href);
      },
    });
  }
}
