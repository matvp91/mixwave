import { PointerEventHandler, useRef, useState } from "react";
import type { ChangeEventHandler } from "react";
import type { HlsState } from "../../main";

type ProgressProps = {
  state: HlsState;
  onSeeked(value: number): void;
};

export function Progress({ state, onSeeked }: ProgressProps) {
  const [seeking, setSeeking] = useState(false);
  const [value, setValue] = useState(state.time);

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

  const max = Number.isFinite(state.duration) ? state.duration : 0;
  let time = Number.isFinite(state.time) ? state.time : 0;

  if (lastSeekRef.current !== null) {
    time = lastSeekRef.current;

    if (state.time > time) {
      lastSeekRef.current = null;
    }
  }

  return (
    <div className="mix-progress">
      <input
        className="mix-progress-range"
        type="range"
        min={0}
        max={max}
        step={0.1}
        value={seeking ? value : time}
        onChange={onChange}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
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
