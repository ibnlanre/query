export type Empty = "";

export function isEmpty(value: unknown): value is Empty {
  return value === "";
}
