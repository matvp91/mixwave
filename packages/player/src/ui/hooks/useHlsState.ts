import { useEffect, useState } from "react";
import { HlsFacade, State } from "../..";

export function useHlsState(facade: HlsFacade) {
  const [state, setState] = useState<State | null>(facade.state);

  useEffect(() => {
    const update = () => setState(facade.state);
    facade.on("*", update);
    return () => {
      facade.off("*", update);
    };
  }, [facade]);

  return state;
}
