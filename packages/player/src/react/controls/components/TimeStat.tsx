import { toHMS } from "../utils";
import { useSelector } from "../..";
import { useFakeTime } from "../hooks/useFakeTime";

export function TimeStat() {
  const fakeTime = useFakeTime();
  const duration = useSelector((facade) => facade.duration);

  const remaining = Math.ceil(duration - fakeTime);
  const hms = toHMS(remaining);

  return (
    <div className="whitespace-nowrap flex justify-end items-center text-white ml-4 min-w-12">
      {hms}
    </div>
  );
}
