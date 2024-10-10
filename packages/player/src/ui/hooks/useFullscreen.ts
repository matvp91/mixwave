import screenfull from "screenfull";
import { useEffect, useState, useMemo, useCallback } from "react";
import type { MouseEventHandler } from "react";

export type UseFullscreen = {
  active: boolean;
  onClick: MouseEventHandler<HTMLElement>;
};

export function useFullscreen(): UseFullscreen | null {
  const [active, setActive] = useState(false);

  useEffect(() => {
    screenfull.on("change", () => {
      setActive(screenfull.isFullscreen);
    });
  }, [screenfull]);

  const onClick: MouseEventHandler<HTMLElement> = useCallback(
    (event) => {
      const element = event.target as HTMLElement;
      const container = element.closest("[data-mix-container]");
      if (container) {
        screenfull.toggle(container);
      }
    },
    [screenfull],
  );

  const ret = useMemo(() => {
    return { active, onClick };
  }, [active, setActive]);

  if (!screenfull.isEnabled) {
    return null;
  }

  return ret;
}
