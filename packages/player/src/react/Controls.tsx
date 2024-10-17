import { BaseControls } from "./components/BaseControls";
import { Start } from "./components/Start";
import { useHlsState } from "./hooks/useHlsState";
import { UiProvider } from "./context/UiContext";
import type { Facade } from ".";
import type { Metadata } from "./types";

export type ControlsProps = {
  facade: Facade;
  metadata?: Metadata;
};

export function Controls({ facade, metadata }: ControlsProps) {
  const state = useHlsState(facade);
  return (
    <UiProvider facade={facade} metadata={metadata} state={state}>
      <Start />;
      <BaseControls />
    </UiProvider>
  );
}
