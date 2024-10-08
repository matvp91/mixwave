export function assert<T>(
  value: T,
  message: string = "value is null",
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw Error(message);
  }
}
