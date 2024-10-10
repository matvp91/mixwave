import { createContext, useContext, useState } from "react";
import { useVisible } from "../hooks/useVisible";
import { useFullscreen } from "../hooks/useFullscreen";
import { useTime } from "../hooks/useTime";
import { useSettings } from "../hooks/useSettings";
import type { ReactNode } from "react";
import type { UseVisible } from "../hooks/useVisible";
import type { UseFullscreen } from "../hooks/useFullscreen";
import type { HlsFacade, State } from "../..";
import type { Metadata } from "../types";
import type { SetSettings, SettingsValue } from "../hooks/useSettings";

type UiContextValue = {
  visible: UseVisible;
  fullscreen: UseFullscreen | null;
  facade: HlsFacade;
  state: State;
  metadata: Metadata;
  seekTo(time: number): void;
  time: number;
  visibleControls: boolean;

  // TODO: refactor these below.
  setSettings: SetSettings;
  settings: SettingsValue | null;
  progressSeeking: boolean;
  setProgressSeeking(value: boolean): void;
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
  const [time, setTargetTime] = useTime(state);

  const [settings, setSettings] = useSettings();
  const [progressSeeking, setProgressSeeking] = useState(false);

  if (!metadata) {
    metadata = {};
  }

  const seekTo = (time: number) => {
    visible.nudge();
    setTargetTime(time);
    facade.seekTo(time);
  };

  let visibleControls = false;
  if (state.isStarted && (visible.visible || settings || progressSeeking)) {
    visibleControls = true;
  }

  return (
    <UiContext.Provider
      value={{
        visible,
        fullscreen,

        facade,
        state,
        metadata,

        seekTo,

        time,
        visibleControls,

        // TODO: Refactor these.
        settings,
        setSettings,
        progressSeeking,
        setProgressSeeking,
      }}
    >
      {children}
    </UiContext.Provider>
  );
}
