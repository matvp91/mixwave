import { PointerEventHandler, useRef, useState } from "react";
import { useDelta } from "../hooks/useDelta";
import type { ChangeEventHandler } from "react";
import type { HlsState } from "../../main";

type ProgressProps = {
  state: HlsState;
  onSeeked(value: number): void;
};

export function Progress({ state, onSeeked }: ProgressProps) {
  const [seeking, setSeeking] = useState(false);
  const [value, setValue] = useState(state.time);

  const deltaTime = useDelta(state.time);

  const lastSeekRef = useRef<number | null>(null);

  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(event.target.valueAsNumber);
  };

  const onPointerDown: PointerEventHandler<HTMLInputElement> = (event) => {
    setSeeking(true);
    setValue(event.currentTarget.valueAsNumber);
  };

  const onPointerUp: PointerEventHandler<HTMLInputElement> = (event) => {
    const targetTime = event.currentTarget.valueAsNumber;

    lastSeekRef.current = targetTime;

    setSeeking(false);
    onSeeked(targetTime);
  };

  let time = state.time;

  if (lastSeekRef.current !== null) {
    // When we have a positive delta, thus we're increasing in time
    // and the time is larger than lastSeek, we no longer need to overwrite
    // the value.
    if (deltaTime && time > lastSeekRef.current) {
      lastSeekRef.current = null;
    } else {
      time = lastSeekRef.current;
    }
  }

  const progress = seeking ? value : time;

  return (
    <div className="mix-progress">
      <input
        className="mix-progress-range"
        type="range"
        min={0}
        max={state.duration}
        step={0.1}
        value={progress}
        onChange={onChange}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      />
      <div className="mix-progress-bg" />
      <div
        className="mix-progress-value"
        style={{
          width: `${(progress / state.duration) * 100}%`,
        }}
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
