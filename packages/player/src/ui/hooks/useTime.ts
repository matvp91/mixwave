import { useEffect, useState } from "react";
import { useDelta } from "./useDelta";
import type { State } from "../..";

export function useTime(state: State) {
  const [targetTime, setTargetTime] = useState<null | number>(null);

  const delta = useDelta(state.time);

  useEffect(() => {
    if (targetTime !== null && delta > 0 && state.time > targetTime) {
      setTargetTime(null);
    }
  }, [state.time, delta, targetTime]);

  useEffect(() => {
    if (state.playheadState === "ended") {
      setTargetTime(null);
    }
  }, [state.playheadState]);

  let fakeTime = state.time;
  if (targetTime !== null) {
    fakeTime = targetTime;
  }

  return [fakeTime, setTargetTime] as const;
}
