import { SettingsMode } from "../hooks/useSettings";
import { useEffect, useLayoutEffect, useRef } from "react";
import cn from "clsx";
import { SettingsPane } from "./SettingsPane";
import { QualitiesPane } from "./QualitiesPane";
import { TextAudioPane } from "./TextAudioPane";
import usePrevious from "../hooks/usePrevious";
import { useUiContext } from "./UiContext";

export function Settings() {
  const { facade, state, settings } = useUiContext();

  const mode = settings?.mode ?? null;

  const ref = useRef<HTMLDivElement>(null);
  const lastModeRef = useRef<SettingsMode>();
  const modePrev = usePrevious(mode);

  if (mode !== null) {
    lastModeRef.current = mode;
  }

  useEffect(() => {
    if (mode === null && modePrev) {
      lastModeRef.current = undefined;

      if (ref.current) {
        ref.current.style.width = "";
        ref.current.style.height = "";
      }
    }
  }, [modePrev, mode]);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const paneElements = element.querySelectorAll<HTMLDivElement>(
      "[data-mix-settings-pane]",
    );

    Array.from(paneElements).map((el) => {
      el.style.width = "";
      el.style.height = "";
      el.style.position = "fixed";

      const rect = el.getBoundingClientRect();

      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;
      el.style.position = "absolute";
    });

    const activePane = element.querySelector<HTMLDivElement>(
      "[data-mix-settings-pane=active]",
    );
    if (activePane) {
      const rect = activePane.getBoundingClientRect();
      element.style.width = `${rect.width}px`;
      element.style.height = `${rect.height}px`;
    }
  });

  const lastMode = lastModeRef.current;

  return (
    <div
      className={cn(
        "absolute right-4 bottom-16 z-50 transition-all overflow-hidden pointer-events-none opacity-0 bg-black/85 text-white rounded-md border border-white/20",
        mode !== null && "opacity-100 pointer-events-auto",
      )}
      ref={ref}
      data-mix-settings
    >
      <SettingsPane active={lastMode === "quality"}>
        <QualitiesPane facade={facade} state={state} />
      </SettingsPane>
      <SettingsPane active={lastMode === "text-audio"}>
        <TextAudioPane facade={facade} state={state} />
      </SettingsPane>
    </div>
  );
}
