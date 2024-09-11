import { toHMS } from "../utils";
import type { State } from "../..";

type TimeStatProps = {
  time: number;
  state: State;
};

export function TimeStat({ time, state }: TimeStatProps) {
  const remaining = Math.ceil(state.duration - time);
  const hms = toHMS(remaining);
  return (
    <div className="whitespace-nowrap flex justify-end items-center text-white ml-4 min-w-12">
      {hms}
    </div>
  );
}
