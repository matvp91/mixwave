import { useRef, useEffect } from "react";

export function useDelta(value: number) {
  const ref = useRef<number>();
  useEffect(() => {
    ref.current = value;
  });
  if (!ref.current) {
    return 0;
  }
  return value - ref.current;
}
