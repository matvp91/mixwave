import cn from "clsx";
import { useEffect, useLayoutEffect, useRef } from "react";
import usePrevious from "../hooks/usePrevious";
import { SettingsPane } from "./SettingsPane";
import { QualitiesPane } from "./QualitiesPane";
import { TextAudioPane } from "./TextAudioPane";
import { useAppStore } from "../hooks/useAppStore";
import type { SettingsMode } from "../hooks/useAppSettings";

export function Settings() {
  const settings = useAppStore((state) => state.settings);
  const ref = useRef<HTMLDivElement>(null);

  const mode = settings?.mode ?? null;

  const lastModeRef = useRef<SettingsMode>();
  if (mode !== null) {
    lastModeRef.current = mode;
  }

  const modePrev = usePrevious(mode);

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
      "[data-sprs-settings-pane]",
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
      "[data-sprs-settings-pane=active]",
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
      data-sprs-settings
    >
      <SettingsPane active={lastMode === "quality"}>
        <QualitiesPane />
      </SettingsPane>
      <SettingsPane active={lastMode === "text-audio"}>
        <TextAudioPane />
      </SettingsPane>
    </div>
  );
}
