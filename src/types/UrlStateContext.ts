import type { Decode } from "./Decode";
import type { Encode } from "./Encode";
import type { GetRule } from "./GetRule";
import type { Parse } from "./Parse";
import type { Push } from "./Push";
import type { Replacer } from "./Replacer";
import type { Reviver } from "./Reviver";
import type { SetRule } from "./SetRule";
import type { Stringify } from "./Stringify";

export type UrlStateContext<Marker extends string> = {
  /**
   * Used to revive the URL.
   *
   * @type {Reviver}
   * @default undefined
   */
  reviver?: Reviver;
  /**
   * Used to replace the URL.
   *
   * @type {Replacer}
   * @default undefined
   */
  replacer?: Replacer;
  /**
   * Enable debug mode.
   *
   * @type {boolean}
   * @default false
   */
  debug?: boolean;
  /**
   * Used to parse the URL.
   *
   * @type {Parse}
   * @default JSON.parse
   */
  parse: Parse;
  /**
   * Used to stringify the URL.
   *
   * @type {Stringify}
   * @default JSON.stringify
   */
  stringify: Stringify;
  /**
   * Used to encode the URL.
   *
   * @type {Encode}
   * @default encodeURIComponent
   */
  encode: Encode;
  /**
   * Used to decode the URL.
   *
   * @type {Decode}
   * @default decodeURIComponent
   */
  decode: Decode;
  /**
   * Used to update the URL.
   *
   * @type {Push}
   * @default pushState
   */
  push: Push;

  /**
   * default transform rule for set.
   *
   * @type {SetRule}
   * @default undefined
   */
  setRule: SetRule<Marker>;

  /**
   * default transform rule for get.
   *
   * @type {GetRule}
   * @default undefined
   */
  getRule: GetRule<Marker>;
};

type Rule<T extends string> = {
  parse: T[];
};

type Context<T extends string> = {
  rule: Rule<T>;
};
