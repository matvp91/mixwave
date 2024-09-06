import type { HlsState } from "../../main";

type TimeStatProps = {
  state: HlsState;
};

export function TimeStat({ state }: TimeStatProps) {
  const remainingTime =
    state.seekRange.end - state.time - state.seekRange.start;

  const value = toHMS(remainingTime);

  return value !== null ? (
    <div className="mix-timestat">{toHMS(remainingTime)}</div>
  ) : null;
}

export function toHMS(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return null;
  }

  const pad = (value: number) =>
    (10 ** 2 + Math.floor(value)).toString().substring(1);

  seconds = Math.floor(seconds);
  if (seconds < 0) {
    seconds = 0;
  }

  let result = "";

  const h = Math.trunc(seconds / 3600) % 24;
  if (h) {
    result += `${pad(h)}:`;
  }

  const m = Math.trunc(seconds / 60) % 60;
  result += `${pad(m)}:`;

  const s = Math.trunc(seconds % 60);
  result += `${pad(s)}`;

  return result;
}
