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
  onClose(): void;
};

export function Settings({ facade, state, mode, onClose }: SettingsProps) {
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

  useEffect(() => {
    if (mode === null) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      const element = event.target as HTMLElement;

      const SETTINGS_ACTION_ATTR = "data-settings-action";
      if (
        element.hasAttribute(SETTINGS_ACTION_ATTR) ||
        element.closest("button")?.hasAttribute(SETTINGS_ACTION_ATTR)
      ) {
        return;
      }

      const isOver = element
        .closest(".mix-container")
        ?.querySelector(".mix-settings")
        ?.contains(element);

      if (!isOver) {
        onClose();
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [mode, onClose]);

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
