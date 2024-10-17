import { BaseControls } from "./components/BaseControls";
import { Start } from "./components/Start";
import { useHlsState } from "./hooks/useHlsState";
import { UiProvider } from "./context/UiContext";
import type { Controller } from "..";
import type { Metadata } from "./types";

export type ControlsProps = {
  controller: Controller;
  metadata?: Metadata;
};

export function Controls({ controller, metadata }: ControlsProps) {
  const state = useHlsState(controller.facade);

  return (
    <UiProvider facade={controller.facade} metadata={metadata} state={state}>
      <Start />;
      <BaseControls />
    </UiProvider>
  );
}
