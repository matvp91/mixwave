import { PointerEventHandler, useState } from "react";
import { toHMS } from "../utils";
import cn from "clsx";
import type { ChangeEventHandler } from "react";
import type { HlsState } from "../../main";

type ProgressProps = {
  time: number;
  state: HlsState;
  onSeeked(value: number): void;
};

export function Progress({ time, state, onSeeked }: ProgressProps) {
  const [seeking, setSeeking] = useState(false);
  const [value, setValue] = useState(0);

  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(event.target.valueAsNumber);
  };

  const onPointerDown: PointerEventHandler<HTMLInputElement> = (event) => {
    setSeeking(true);
    setValue(event.currentTarget.valueAsNumber);
  };

  const onPointerUp: PointerEventHandler<HTMLInputElement> = (event) => {
    const targetTime = event.currentTarget.valueAsNumber;
    onSeeked(targetTime);
    setSeeking(false);
  };

  const progress = seeking ? value : time;

  return (
    <div className="mix-progress">
      <div
        className={cn(
          "mix-progress-tooltip",
          seeking && "mix-progress-tooltip--active",
        )}
        style={{
          left: `${(value / state.duration) * 100}%`,
        }}
      >
        {toHMS(value)}
      </div>
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
