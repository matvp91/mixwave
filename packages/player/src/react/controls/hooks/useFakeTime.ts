import { useDelta } from "./useDelta";
import { useAppStore } from "../AppStoreProvider";
import { useSelector } from "../..";
import { useLayoutEffect } from "react";

export function useFakeTime() {
  const time = useSelector((facade) => facade.time);
  const playhead = useSelector((facade) => facade.playhead);
  const targetTime = useAppStore((state) => state.targetTime);
  const setTargetTime = useAppStore((state) => state.setTargetTime);

  const delta = useDelta(time);

  useLayoutEffect(() => {
    if (targetTime === null) {
      return;
    }
    // Check if we need to reset targetTime.
    if ((delta > 0 && time > targetTime) || playhead === "ended") {
      setTargetTime(null);
    }
  }, [targetTime]);

  let fakeTime = time;
  if (targetTime !== null) {
    fakeTime = targetTime;
  }

  return fakeTime;
}
