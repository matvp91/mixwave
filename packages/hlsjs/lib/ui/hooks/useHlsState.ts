import { useEffect, useState } from "react";
import { HlsFacade, HlsState } from "../../main";

export function useHlsState(facade: HlsFacade) {
  const [state, setState] = useState<HlsState>(facade.state);

  useEffect(() => {
    const update = () => setState(facade.state);
    facade.on("*", update);
    return () => {
      facade.off("*", update);
    };
  }, [facade]);

  return state;
}
