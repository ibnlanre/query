import { type Empty, isEmpty } from "../is-empty";
import { type Nullish, isNullish } from "../is-nullish";

export type Defined<Value extends unknown> = Exclude<Value, Empty | Nullish>;

export function isDefined<Value>(
  value: Value | Empty | Nullish
): value is Defined<Value> {
  return !isEmpty(value) && !isNullish(value);
}
