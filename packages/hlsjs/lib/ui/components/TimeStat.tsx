import { toHMS } from "../utils";
import type { HlsState } from "../../main";

type TimeStatProps = {
  time: number;
  state: HlsState;
};

export function TimeStat({ time, state }: TimeStatProps) {
  const remaining = Math.ceil(state.duration - time);
  const hms = toHMS(remaining);
  return <div className="mix-timestat">{hms}</div>;
}
