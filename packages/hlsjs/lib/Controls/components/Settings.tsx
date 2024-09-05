import { SettingsMode } from "../hooks/useSettings";
import { useEffect, useLayoutEffect, useRef } from "react";
import cn from "clsx";
import { SettingsPane } from "./SettingsPane";
import { QualitiesPane } from "./QualitiesPane";
import { TextAudioPane } from "./TextAudioPane";
import type { HlsFacade, HlsState } from "../../main";
import usePrevious from "../hooks/usePrevious";

type SettingsProps = {
  facade: HlsFacade;
  state: HlsState;
  mode: SettingsMode | null;
};

export function Settings({ facade, state, mode }: SettingsProps) {
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

    const paneElements =
      element.querySelectorAll<HTMLDivElement>(".mix-settings-pane");

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
      ".mix-settings-pane--active",
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
      className={cn("mix-settings", mode !== null && "mix-settings--visible")}
      ref={ref}
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
