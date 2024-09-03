import { useEffect, useState } from "react";
import type { HlsState, HlsFacade } from "./main";

type HlsControlsProps = {
  facade: HlsFacade;
};

export function HlsControls({ facade }: HlsControlsProps) {
  const [state, setState] = useState<HlsState>(facade.state);
  const [time, setTime] = useState(facade.time);

  useEffect(() => {
    const update = () => setState(facade.state);
    facade.on("*", update);
    return () => {
      facade.off("*", update);
    };
  }, [facade]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(facade.time);
    }, 500);
    return () => {
      clearInterval(intervalId);
    };
  }, [facade]);

  return (
    <div>
      <button onClick={() => facade.playOrPause()}>
        {state.playheadState === "play" ? "Pause" : "Play"}
      </button>
      time: {time}
    </div>
  );
}
