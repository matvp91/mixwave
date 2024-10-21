import { useCallback, useEffect, useRef } from "react";
import { useAppStore } from "../hooks/useAppStore";

export type SettingsMode = "text-audio" | "quality";

export type Settings = {
  entry: "hover" | "explicit";
  mode: SettingsMode;
};

export type SetAppSettings = ReturnType<typeof useAppSettings>;

export function useAppSettings() {
  const timerRef = useRef<number>();
  const settings = useAppStore((state) => state.settings);
  const setSettings = useAppStore((state) => state.setSettings);

  useEffect(() => {
    if (!settings) {
      return;
    }

    if (settings.entry === "hover") {
      const onPointerMove = (event: PointerEvent) => {
        const isOver = isOverSettings(event.target);

        if (isOver && timerRef.current !== undefined) {
          clearTimeout(timerRef.current);
          timerRef.current = undefined;
        }

        if (!isOver && timerRef.current === undefined) {
          timerRef.current = window.setTimeout(() => {
            setSettings(null);
            timerRef.current = undefined;
          }, 200);
        }
      };

      window.addEventListener("pointermove", onPointerMove);

      return () => {
        window.removeEventListener("pointermove", onPointerMove);
        clearTimeout(timerRef.current);
      };
    }

    if (settings.entry === "explicit") {
      const onPointerDown = (event: PointerEvent) => {
        const isOver = isOverSettings(event.target);
        if (!isOver) {
          setSettings(null);
        }
      };

      window.addEventListener("pointerdown", onPointerDown);

      return () => {
        window.removeEventListener("pointerdown", onPointerDown);
      };
    }
  }, [settings]);

  const setAppSettings = useCallback(
    (mode: SettingsMode | null, hoverEntry?: boolean) => {
      if (
        mode === settings?.mode &&
        hoverEntry &&
        settings?.entry === "explicit"
      ) {
        return;
      }

      if (settings?.entry === "explicit" && settings.mode === mode) {
        setSettings(null);
        return;
      }

      if (mode === null) {
        setSettings(null);
      } else {
        setSettings({
          mode,
          entry: hoverEntry ? "hover" : "explicit",
        });
      }
    },
    [setSettings, settings],
  );

  return setAppSettings;
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

  const container = matchElement(target, "data-sprs-container");
  if (container?.querySelector("[data-sprs-settings")?.matches(":hover")) {
    isOver = true;
  }

  const element = matchElement(target, "data-sprs-settings-action");
  if (element?.matches(":hover")) {
    isOver = true;
  }

  return isOver;
}
