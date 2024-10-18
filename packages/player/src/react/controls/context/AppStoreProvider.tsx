import { createStore } from "zustand";
import { createContext, useContext, useEffect, useState } from "react";
import { ControllerContext, Events } from "../..";
import type { ReactNode } from "react";
import type { Settings } from "../hooks/useAppSettings";

type AppStore = ReturnType<typeof createAppStore>;

export interface AppState {
  seeking: boolean;
  setSeeking(value: boolean): void;
  targetTime: number | null;
  setTargetTime(value: number | null): void;
  visible: boolean;
  setVisible(value: boolean): void;
  settings: Settings | null;
  setSettings(value: Settings | null): void;
  fullscreen: boolean;
  setFullscreen(value: boolean): void;
}

export const StoreContext = createContext<AppStore>({} as AppStore);

type StoreProviderProps = {
  children: ReactNode;
};

export function AppStoreProvider({ children }: StoreProviderProps) {
  const [store] = useState(createAppStore);
  const controller = useContext(ControllerContext);

  useEffect(() => {
    let prevTime = 0;

    const onChange = () => {
      const { targetTime, setTargetTime } = store.getState();

      if (targetTime === null) {
        return;
      }

      const { time, playhead } = controller.facade;
      const delta = time - prevTime;
      prevTime = time;

      if ((delta > 0 && time > targetTime) || playhead === "ended") {
        setTargetTime(null);
      }
    };

    return controller.subscribe(onChange);
  }, [controller]);

  useEffect(() => {
    const onReset = () => {
      const initialState = store.getInitialState();
      store.setState(initialState, true);
    };
    controller.facade.on(Events.RESET, onReset);
    return () => {
      controller.facade.off(Events.RESET, onReset);
    };
  }, [controller.facade]);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

function createAppStore() {
  return createStore<AppState>((set) => ({
    seeking: false,
    setSeeking: (seeking) => set({ seeking }),
    targetTime: null,
    setTargetTime: (targetTime) => set({ targetTime }),
    visible: false,
    setVisible: (visible) => set({ visible }),
    settings: null,
    setSettings: (settings) => set({ settings }),
    fullscreen: false,
    setFullscreen: (fullscreen) => set({ fullscreen }),
  }));
}
