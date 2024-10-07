import { Controls } from "./Controls";
import { Start } from "./Start";
import { useHlsState } from "../hooks/useHlsState";
import type { HlsFacade } from "../..";
import type { Metadata } from "../types";

type UiProps = {
  facade: HlsFacade;
  metadata?: Metadata;
};

export function Ui({ facade, metadata }: UiProps) {
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
