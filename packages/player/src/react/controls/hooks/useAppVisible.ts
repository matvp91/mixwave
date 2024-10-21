import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "../hooks/useAppStore";

export function useAppVisible() {
  const timerRef = useRef<number>();
  const elementRef = useRef<HTMLDivElement>(null);
  const setVisible = useAppStore((state) => state.setVisible);

  const onPointerMove = useCallback(() => {
    clearTimeout(timerRef.current);

    setVisible(true);
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
    }, 3000);
  }, [setVisible]);

  const nudge = useCallback(() => {
    onPointerMove();
  }, [onPointerMove]);

  useEffect(() => {
    const el = elementRef.current?.closest("[data-sprs-container]");
    if (!el) {
      return;
    }

    const container = el as HTMLDivElement;

    const onPointerLeave = () => {
      clearTimeout(timerRef.current);
      setVisible(false);
    };

    container.addEventListener("pointerdown", nudge);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    return () => {
      container.removeEventListener("pointerdown", nudge);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [onPointerMove, setVisible, nudge]);

  return [elementRef, nudge] as const;
}
