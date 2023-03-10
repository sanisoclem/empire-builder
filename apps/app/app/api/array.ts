export const mapNonEmpty = <T extends unknown, U>(
  [v, ...vs]: NonEmptyArray<T>,
  fn: (a: T) => U
): NonEmptyArray<U> => [fn(v), ...vs.map(fn)];