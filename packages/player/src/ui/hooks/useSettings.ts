import { useEffect, useState, useRef } from "react";

export type SettingsMode = "text-audio" | "quality";

type Value = {
  entry: "hover" | "explicit";
  mode: SettingsMode;
};

export function useSettings() {
  const timerRef = useRef<number>();
  const [value, setValue] = useState<Value | null>(null);

  const updateValue = (mode: SettingsMode | null, hoverEntry?: boolean) => {
    if (mode === value?.mode && hoverEntry && value?.entry === "explicit") {
      return;
    }

    if (value?.entry === "explicit" && value.mode === mode) {
      setValue(null);
      return;
    }

    if (mode === null) {
      setValue(null);
    } else {
      setValue({
        mode,
        entry: hoverEntry ? "hover" : "explicit",
      });
    }
  };

  useEffect(() => {
    if (value?.entry === "hover") {
      const onPointerMove = (event: PointerEvent) => {
        const isOver = isOverSettings(event.target);

        if (isOver && timerRef.current !== undefined) {
          clearTimeout(timerRef.current);
          timerRef.current = undefined;
        }

        if (!isOver && timerRef.current === undefined) {
          timerRef.current = setTimeout(() => {
            setValue(null);
            timerRef.current = undefined;
          }, 200);
        }
      };

      window.addEventListener("pointermove", onPointerMove);

      return () => {
        window.removeEventListener("pointermove", onPointerMove);
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      };
    }

    if (value?.entry === "explicit") {
      const onPointerDown = (event: PointerEvent) => {
        const isOver = isOverSettings(event.target);
        if (!isOver) {
          setValue(null);
        }
      };

      window.addEventListener("pointerdown", onPointerDown);

      return () => {
        window.removeEventListener("pointerdown", onPointerDown);
      };
    }
  }, [value]);

  return [value, updateValue] as const;
}

function matchElement(target: EventTarget | null, attr: string) {
  if (!target) {
    return null;
  }
  const element = target as HTMLElement;
  if (element.hasAttribute(attr)) {
    return element;
  }
  const parent = element.closest(`[${attr}]`);
  if (parent) {
    return parent as HTMLElement;
  }
  return null;
}

function isOverSettings(target: EventTarget | null) {
  let isOver = false;

  const container = matchElement(target, "data-mix-container");
  if (container?.querySelector("[data-mix-settings")?.matches(":hover")) {
    isOver = true;
  }

  const element = matchElement(target, "data-mix-settings-action");
  if (element?.matches(":hover")) {
    isOver = true;
  }

  return isOver;
}
