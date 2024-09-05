import { SettingsMode } from "../hooks/useSettings";
import { useLayoutEffect, useRef } from "react";
import cn from "clsx";
import { SettingsPane } from "./SettingsPane";
import type { HlsFacade, HlsState } from "../../main";

type SettingsProps = {
  facade: HlsFacade;
  state: HlsState;
  mode: SettingsMode | null;
};

export function Settings({ facade, state, mode }: SettingsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lastModeRef = useRef<SettingsMode>();

  if (mode !== null) {
    lastModeRef.current = mode;
  }

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
      el.style.left = "0";
      el.style.top = "0";
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
        {state.qualities.map((quality) => (
          <div
            key={quality.id}
            onClick={() => {
              facade.setQuality(quality.id);
            }}
          >
            {quality.active ? "•" : ""} {quality.height}p
          </div>
        ))}
      </SettingsPane>
      <SettingsPane active={lastMode === "text-audio"}>
        Audio and text
      </SettingsPane>
    </div>
  );
}
