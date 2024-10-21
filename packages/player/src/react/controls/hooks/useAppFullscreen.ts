import { MouseEventHandler, useCallback, useEffect } from "react";
import screenfull from "screenfull";
import { useAppStore } from "../hooks/useAppStore";

export function useAppFullscreen() {
  const setFullscreen = useAppStore((state) => state.setFullscreen);

  useEffect(() => {
    screenfull.on("change", () => {
      setFullscreen(screenfull.isFullscreen);
    });
  }, [screenfull, setFullscreen]);

  const onClick: MouseEventHandler<HTMLElement> = useCallback(
    (event) => {
      const element = event.target as HTMLElement;
      const container = element.closest("[data-sprs-container]");
      if (container) {
        screenfull.toggle(container);
      }
    },
    [screenfull],
  );

  return onClick;
}
