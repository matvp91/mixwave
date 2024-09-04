import { useEffect, useState, useRef } from "react";
import { Progress } from "./Progress";
import styles from "./styles.module.scss";
import Play from "./play.svg?react";
import Pause from "./pause.svg?react";
import type { HlsState, HlsFacade } from "./main";

type HlsControlsProps = {
  facade: HlsFacade;
};

export function HlsControls({ facade }: HlsControlsProps) {
  const [state, setState] = useState<HlsState>(facade.state);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const update = () => setState(facade.state);
    facade.on("*", update);
    return () => {
      facade.off("*", update);
    };
  }, [facade]);

  const ref = useRef<number>();

  const onMouseMove = () => {
    clearTimeout(ref.current);
    setVisible(true);
    ref.current = setTimeout(() => {
      setVisible(false);
    }, 3000);
  };

  const onMouseLeave = () => {
    clearTimeout(ref.current);
    setVisible(false);
  };

  return (
    <div
      className={styles.root}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={styles.controls}
        style={{
          display: visible ? "" : "none",
        }}
      >
        {Number.isFinite(state.duration) ? (
          <Progress
            state={state}
            onSeeked={(time) => {
              facade.seekTo(time);
            }}
          />
        ) : null}
        <div className={styles.buttons}>
          <button
            className={styles.button}
            onClick={() => facade.playOrPause()}
          >
            {state.playheadState === "play" ? <Pause /> : <Play />}
          </button>
        </div>
      </div>
    </div>
  );
}
