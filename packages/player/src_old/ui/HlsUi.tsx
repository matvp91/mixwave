import { Controls } from "./components/Controls";
import { Start } from "./components/Start";
import { useHlsState } from "./hooks/useHlsState";
import { UiProvider } from "./context/UiContext";
import type { HlsFacade } from "..";
import type { Metadata } from "./types";

/** @hidden */
export type HlsUiProps = {
  facade: HlsFacade;
  metadata?: Metadata;
};

/** @hidden */
export function HlsUi({ facade, metadata }: HlsUiProps) {
  const state = useHlsState(facade);

  if (!state.loaded) {
    return null;
  }

  return (
    <UiProvider facade={facade} metadata={metadata} state={state}>
      <Start />;
      <Controls />
    </UiProvider>
  );
}
