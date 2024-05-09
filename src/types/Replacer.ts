import type { This } from "./This";

export type Replacer = (this: This, key: string, value: unknown) => unknown;
