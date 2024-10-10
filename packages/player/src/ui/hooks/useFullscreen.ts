import screenfull from "screenfull";
import { useEffect, useState } from "react";
import type { MouseEventHandler } from "react";

export type Fullscreen = {
  active: boolean;
  onClick: MouseEventHandler<HTMLElement>;
};

export function useFullscreen(): Fullscreen | null {
  const [active, setActive] = useState(false);

  useEffect(() => {
    screenfull.on("change", () => {
      setActive(screenfull.isFullscreen);
    });
  }, [screenfull]);

  if (!screenfull.isEnabled) {
    return null;
  }

  const onClick: MouseEventHandler<HTMLElement> = (event) => {
    const element = event.target as HTMLElement;
    const container = element.closest("[data-mix-container]");
    if (container) {
      screenfull.toggle(container);
    }
  };

  return { active, onClick };
}
