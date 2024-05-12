import { UrlStateContext } from "@/types";
import { assign } from "../assign";

export function mergeContext(
  original: UrlStateContext,
  context?: Partial<UrlStateContext>
): UrlStateContext {
  return assign(original, context);
}
