export function assign<Target extends {}, Source extends unknown>(
  target: Target,
  source: Source
) {
  const result = Object.create(target);
  return Object.assign(result, source);
}
