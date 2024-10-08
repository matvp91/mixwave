import { Controls } from "./Controls";
import { Start } from "./Start";
import { useHlsState } from "../hooks/useHlsState";
import type { HlsFacade } from "../..";
import type { Metadata } from "../types";

/** @hidden */
export type HlsUiProps = {
  facade: HlsFacade;
  metadata?: Metadata;
};

/** @hidden */
export function HlsUi({ facade, metadata }: HlsUiProps) {
  const state = useHlsState(facade);

  if (!state?.duration) {
    return null;
  }

  return (
    <>
      <Start facade={facade} state={state} />;
      <Controls facade={facade} state={state} metadata={metadata} />
    </>
  );
}
