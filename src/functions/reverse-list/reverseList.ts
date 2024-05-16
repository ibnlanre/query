export function reverseList<
  Key extends string,
  Value extends string[] | undefined,
  Context extends Partial<Record<Key, Value>>
>(configuration: Context) {
  return Object.entries<Value>(
    configuration as Record<PropertyKey, Value>
  ).reduce((search, [key, value]) => {
    if (!value) return search;
    for (const item of value) search[item] = key as Key;
    return search;
  }, {} as Record<string, Key>);
}
