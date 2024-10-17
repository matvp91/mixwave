import { createStore, useStore } from "zustand";
import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { Settings } from "./hooks/useAppSettings";

interface AppState {
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

const appStore = createStore<AppState>((set) => ({
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

type AppStore = typeof appStore;

export const StoreContext = createContext<AppStore>({} as AppStore);

type StoreProviderProps = {
  children: ReactNode;
};

export function AppStoreProvider({ children }: StoreProviderProps) {
  return (
    <StoreContext.Provider value={appStore}>{children}</StoreContext.Provider>
  );
}

export function useAppStore<T>(selector: (state: AppState) => T) {
  const store = useContext(StoreContext);
  return useStore(store, selector);
}
