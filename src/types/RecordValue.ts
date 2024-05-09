import type { Nullish } from "../guards";

export type RecordValue = string | Nullish | (string | Nullish)[];
