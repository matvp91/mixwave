import { Controls } from "./Controls";
import { Start } from "./Start";
import { useHlsState } from "../hooks/useHlsState";
import type { HlsFacade } from "../..";
import type { Metadata } from "../types";
import { UiProvider } from "./UiContext";

/** @hidden */
export type HlsUiProps = {
  facade: HlsFacade;
  metadata?: Metadata;
};

/** @hidden */
export function HlsUi({ facade, metadata }: HlsUiProps) {
  const state = useHlsState(facade);

  if (!state) {
    return null;
  }

  return (
    <UiProvider facade={facade} metadata={metadata} state={state}>
      <Start />;
      <Controls />
    </UiProvider>
  );
}
