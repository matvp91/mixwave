import { useContext, useEffect } from "react";
import { ControllerContext } from "../..";
import { useAppStore } from "../AppStoreProvider";

export function useSideEffects() {
  const controller = useContext(ControllerContext);
  const targetTime = useAppStore((state) => state.targetTime);
  const setTargetTime = useAppStore((state) => state.setTargetTime);

  useEffect(() => {
    if (!targetTime) {
      return;
    }

    const { facade } = controller;

    let prevTime: number | undefined;

    return controller.subscribe(() => {
      const delta = prevTime === undefined ? 0 : facade.time - prevTime;
      prevTime = facade.time;

      if (
        (delta > 0 && facade.time > targetTime) ||
        facade.playhead === "ended"
      ) {
        console.log("reset targetTime");
        setTargetTime(null);
      }
    });
  }, [controller, setTargetTime, targetTime]);
}
