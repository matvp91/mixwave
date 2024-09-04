import { PointerEventHandler, useState, type ChangeEventHandler } from "react";
import styles from "./styles.module.scss";
import type { HlsState } from "./main";

type ProgressProps = {
  state: HlsState;
  onSeeked(value: number): void;
};

export function Progress({ state, onSeeked }: ProgressProps) {
  const [seeking, setSeeking] = useState(false);
  const [value, setValue] = useState(state.time);

  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(event.target.valueAsNumber);
  };

  const onPointerDown: PointerEventHandler<HTMLInputElement> = (event) => {
    setSeeking(true);
    setValue(event.currentTarget.valueAsNumber);
  };

  const onPointerUp: PointerEventHandler<HTMLInputElement> = (event) => {
    setSeeking(false);
    onSeeked(event.currentTarget.valueAsNumber);
  };

  return (
    <div className={styles.progress}>
      <input
        type="range"
        min={0}
        max={state.duration}
        step={0.1}
        value={seeking ? value : state.time}
        onChange={onChange}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      />
    </div>
  );
}
