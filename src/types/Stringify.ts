import type { Replacer } from "./Replacer";

export type Stringify = <T>(value: T, replacer?: Replacer) => string;
