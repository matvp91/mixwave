import usePrevious from "./usePrevious";

export function useDelta(value: number) {
  const prev = usePrevious(value);
  return prev === undefined ? 0 : value - prev;
}
