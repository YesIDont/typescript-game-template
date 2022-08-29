/** Throw error if passed value / object is null or undefined. */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function notNull<T>(item: T | null | undefined): T {
  if (item === null || item === undefined)
    new Error(`Found ${typeof item} instead of object or value.`);

  return item!;
}
