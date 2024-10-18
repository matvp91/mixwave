import { useContext } from "react";
import { useStore } from "zustand";
import { StoreContext } from "../context/AppStoreProvider";
import type { AppState } from "../context/AppStoreProvider";

export function useAppStore<T>(selector: (state: AppState) => T) {
  const store = useContext(StoreContext);
  return useStore(store, selector);
}
