import { useAppStore } from "../hooks/useAppStore";
import { useSelector } from "../..";

export function useFakeTime() {
  const time = useSelector((facade) => facade.time);
  const targetTime = useAppStore((state) => state.targetTime);

  let fakeTime = time;
  if (targetTime !== null) {
    fakeTime = targetTime;
  }

  return fakeTime;
}
