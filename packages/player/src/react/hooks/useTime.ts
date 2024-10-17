import { useState } from "react";
import { useDelta } from "./useDelta";
import type { StoreState } from "../hooks/useHlsState";

export function useTime(state: StoreState) {
  const [targetTime, setTargetTime] = useState<null | number>(null);

  const delta = useDelta(state.time);

  if (targetTime !== null) {
    // Check if we need to reset targetTime.
    if ((delta > 0 && state.time > targetTime) || state.playhead === "ended") {
      setTargetTime(null);
    }
  }

  let fakeTime = state.time;
  if (targetTime !== null) {
    fakeTime = targetTime;
  }

  return [fakeTime, setTargetTime] as const;
}
