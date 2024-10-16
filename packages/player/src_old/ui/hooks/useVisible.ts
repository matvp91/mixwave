import { useEffect, useRef, useState, useCallback } from "react";
import type { RefObject } from "react";

export type UseVisible = {
  visible: boolean;
  elementRef: RefObject<HTMLDivElement>;
  nudge(): void;
};

export function useVisible(): UseVisible {
  const timerRef = useRef<number>();
  const elementRef = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = elementRef.current?.closest("[data-mix-container]") as
      | HTMLDivElement
      | undefined;

    if (!container) {
      return;
    }

    const onPointerLeave = () => {
      clearTimeout(timerRef.current);
      setVisible(false);
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    return () => {
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

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

  return { visible, elementRef, nudge };
}
