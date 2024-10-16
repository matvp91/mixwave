import { createContext, useContext, useState } from "react";
import { useVisible } from "../hooks/useVisible";
import { useFullscreen } from "../hooks/useFullscreen";
import { useTime } from "../hooks/useTime";
import { useSettings } from "../hooks/useSettings";
import type { ReactNode } from "react";
import type { UseVisible } from "../hooks/useVisible";
import type { UseSettings } from "../hooks/useSettings";
import type { UseFullscreen } from "../hooks/useFullscreen";
import type { HlsFacade, State } from "../..";
import type { Metadata } from "../types";

type UiContextValue = {
  visible: UseVisible;
  settings: UseSettings;
  fullscreen: UseFullscreen | null;
  facade: HlsFacade;
  state: State;
  metadata: Metadata;
  seekTo(time: number): void;
  time: number;
  visibleControls: boolean;
  seeking: boolean;
  setSeeking(value: boolean): void;
};

export const UiContext = createContext<UiContextValue>({} as UiContextValue);

export function useUiContext() {
  return useContext(UiContext);
}

type UiProviderProps = {
  children: ReactNode;
  facade: HlsFacade;
  state: State;
  metadata?: Metadata;
};

export function UiProvider({
  children,
  facade,
  state,
  metadata,
}: UiProviderProps) {
  const visible = useVisible();
  const fullscreen = useFullscreen();
  const settings = useSettings();

  const [time, setTargetTime] = useTime(state);

  const [seeking, setSeeking] = useState(false);

  if (!metadata) {
    metadata = {};
  }

  const seekTo = (time: number) => {
    visible.nudge();
    setTargetTime(time);
    facade.seekTo(time);
  };

  let visibleControls = false;
  if (state.started && (visible.visible || settings.value || seeking)) {
    visibleControls = true;
  }

  return (
    <UiContext.Provider
      value={{
        visible,
        settings,
        fullscreen,

        facade,
        state,
        metadata,

        seekTo,

        time,
        visibleControls,

        seeking,
        setSeeking,
      }}
    >
      {children}
    </UiContext.Provider>
  );
}
