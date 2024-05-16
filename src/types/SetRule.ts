export type SetRule<Marker extends string> = Partial<{
  /**
   * List of query keys to encode by default.
   *
   * @type {string[]}
   * @default []
   * @example
   * ["category"]
   * ["category", "tag"]
   * ["category", "tag", "author"]
   */
  encode: Marker[];

  /**
   * List of query keys to stringify by default.
   *
   * @type {string[]}
   * @default []
   * @example
   * ["id"]
   * ["id", "name"]
   * ["id", "name", "email"]
   */
  stringify: Marker[];
}>;
