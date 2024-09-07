import {
  PointerEventHandler,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toHMS } from "../utils";
import cn from "clsx";
import type { HlsState } from "../../main";

type ProgressProps = {
  time: number;
  state: HlsState;
  onSeeked(value: number): void;
};

export function Progress({ time, state, onSeeked }: ProgressProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [seeking, setSeeking] = useState(false);
  const [hover, setHover] = useState(false);
  const [value, setValue] = useState(0);

  const updateValue = useCallback(
    (event: PointerEvent | React.PointerEvent) => {
      let x =
        (event.pageX - ref.current!.offsetLeft) / ref.current!.offsetWidth;
      x = Math.min(Math.max(x, 0), 1);
      x *= state.duration;

      setValue(x);

      return x;
    },
    [state.duration],
  );

  const onPointerDown: PointerEventHandler = (event) => {
    event.preventDefault();
    updateValue(event);
    setSeeking(true);
  };

  const onPointerEnter = () => {
    setHover(true);
  };

  const onPointerLeave = () => {
    setHover(false);
  };

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      updateValue(event);
    };

    window.addEventListener("pointermove", onPointerMove);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [updateValue]);

  useEffect(() => {
    if (!seeking) {
      return;
    }

    const onPointerUp = (event: PointerEvent) => {
      const time = updateValue(event);
      onSeeked(time);
      setSeeking(false);
    };

    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [updateValue, seeking]);

  const active = seeking || hover;
  const progress = seeking ? value : time;

  return (
    <div
      ref={ref}
      className="mix-progress"
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div
        className={cn(
          "mix-progress-tooltip",
          active && "mix-progress-tooltip--active",
        )}
        style={{
          left: `${(value / state.duration) * 100}%`,
        }}
      >
        {toHMS(value)}
      </div>
      <div className="mix-progress-bg" />
      {active ? (
        <div
          className="mix-progress-value-hover"
          style={{ width: `${(value / state.duration) * 100}%` }}
        />
      ) : null}
      <div
        className="mix-progress-value"
        style={{
          width: `${(progress / state.duration) * 100}%`,
        }}
      />
      <div
        className={cn(
          "mix-progress-scrubber",
          seeking && "mix-progress-scrubber--active",
        )}
        style={{ left: `${(progress / state.duration) * 100}%` }}
      />
      {state.cuePoints.map((cuePoint) => (
        <div
          key={cuePoint}
          className="mix-progress-cuepoint"
          style={{ left: `${(cuePoint / state.duration) * 100}%` }}
        />
      ))}
    </div>
  );
}
