import { toHMS } from "../utils";
import { useUiContext } from "../context/UiContext";

export function TimeStat() {
  const { time, state } = useUiContext();

  const remaining = Math.ceil(state.duration - time);
  const hms = toHMS(remaining);

  return (
    <div className="whitespace-nowrap flex justify-end items-center text-white ml-4 min-w-12">
      {hms}
    </div>
  );
}
