import { useEffect, useRef, useState } from "react";

export function useVisible() {
  const ref = useRef<number>();
  const elementRef = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState(false);

  const onPointerMove = () => {
    clearTimeout(ref.current);

    setVisible(true);

    ref.current = setTimeout(() => {
      setVisible(false);
    }, 3000);
  };

  useEffect(() => {
    const container = elementRef.current?.closest(".mix-container") as
      | HTMLDivElement
      | undefined;

    if (!container) {
      return;
    }

    const onPointerLeave = () => {
      clearTimeout(ref.current);
      setVisible(false);
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    return () => {
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  const nudge = () => {
    onPointerMove();
  };

  return {
    visible,
    elementRef,
    nudge,
  };
}
