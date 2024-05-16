export type GetRule<Marker extends string> = Partial<{
  /**
   * List of query keys to decode by default.
   *
   * @type {string[]}
   * @default []
   * @example
   * ["code"]
   * ["code", "status"]
   * ["code", "status", "type"]
   */
  decode: Marker[];

  /**
   * List of query keys to parse by default.
   *
   * @type {string[]}
   * @default []
   * @example
   * ["query"]
   * ["query", "search"]
   * ["query", "search", "filter"]
   */
  parse: Marker[];

  /**
   * List of query keys to convert to date by default.
   *
   * @type {string[]}
   * @default []
   * @example
   * ["date"]
   * ["date", "birthday"]
   * ["date", "birthday", "anniversary"]
   */
  datetime: Marker[];

  /**
   * List of query keys to convert to number by default.
   *
   * @type {string[]}
   * @default []
   * @example
   * ["page"]
   * ["page", "limit"]
   * ["page", "limit", "offset"]
   */
  number: Marker[];

  /**
   * List of query keys to convert to boolean by default.
   *
   * @type {string[]}
   * @default []
   * @example
   * ["active"]
   * ["active", "completed"]
   * ["active", "completed", "pending"]
   */
  boolean: Marker[];

  /**
   * List of query keys to convert to timestamp by default.
   *
   * @type {string[]}
   * @default []
   * @example
   * ["created"]
   * ["created", "updated"]
   * ["created", "updated", "deleted"]
   */
  timestamp: Marker[];
}>;
