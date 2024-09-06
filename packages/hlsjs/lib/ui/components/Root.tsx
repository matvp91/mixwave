import { Controls } from "./Controls";
import { useHlsState } from "../hooks/useHlsState";
import type { HlsFacade } from "../../main";

type RootProps = {
  facade: HlsFacade;
};

export function Root({ facade }: RootProps) {
  const state = useHlsState(facade);

  return <Controls facade={facade} state={state} />;
}
