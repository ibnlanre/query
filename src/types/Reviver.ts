import type { This } from "./This";

export type Reviver = (this: This, key: string, value: unknown) => unknown;
