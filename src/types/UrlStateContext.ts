import type {
  Reviver,
  Replacer,
  Parse,
  Stringify,
  Encode,
  Decode,
  Push,
} from "..";

export type UrlStateContext = {
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
};
