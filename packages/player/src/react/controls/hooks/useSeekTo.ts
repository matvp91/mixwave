import { useCallback } from "react";
import { useFacade } from "../..";
import { useAppStore } from "../AppStoreProvider";

export function useSeekTo() {
  const facade = useFacade();
  const setTargetTime = useAppStore((state) => state.setTargetTime);

  const seekTo = useCallback(
    (targetTime: number) => {
      facade.seekTo(targetTime);
      setTargetTime(targetTime);
    },
    [facade, setTargetTime],
  );

  return seekTo;
}
