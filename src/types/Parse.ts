import type { Reviver } from "./Reviver";

export type Parse = <T>(value: string, reviver?: Reviver) => T;
