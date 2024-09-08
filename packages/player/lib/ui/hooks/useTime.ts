import { useEffect, useState } from "react";
import { useDelta } from "./useDelta";

export function useTime(time: number) {
  const [targetTime, setTargetTime] = useState<null | number>(null);

  const delta = useDelta(time);

  useEffect(() => {
    if (targetTime !== null && delta > 0 && time > targetTime) {
      setTargetTime(null);
    }
  }, [time, delta, targetTime]);

  let fakeTime = time;
  if (targetTime !== null) {
    fakeTime = targetTime;
  }

  return [fakeTime, setTargetTime] as const;
}
