import { ControllerContext } from "..";
import { BaseControls } from "./components/BaseControls";
import { Start } from "./components/Start";
import { useHlsState } from "./hooks/useHlsState";
import { UiProvider } from "./context/UiContext";
import { useContext } from "react";
import type { Metadata } from "./types";

export type ControlsProps = {
  metadata?: Metadata;
};

export function Controls({ metadata }: ControlsProps) {
  const controller = useContext(ControllerContext);
  const state = useHlsState(controller.facade);

  return (
    <UiProvider facade={controller.facade} metadata={metadata} state={state}>
      <Start />
      <BaseControls />
    </UiProvider>
  );
}
