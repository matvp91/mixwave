import Loader from "lucide-react/icons/loader";
import CircleDotDashed from "lucide-react/icons/circle-dot-dashed";
import Check from "lucide-react/icons/check";
import X from "lucide-react/icons/x";
import CircleOff from "lucide-react/icons/circle-off";
import { cn } from "@/lib/utils";
import type { Job } from "@/api";

export function JobState({ state }: { state: Job["state"] }) {
  if (state === "completed") {
    return createCircle(
      "bg-emerald-200 text-emerald-800 dark:bg-emerald-400",
      Check,
    );
  }
  if (state === "failed") {
    return createCircle("bg-red-200 text-red-800 dark:bg-red-400", X);
  }
  if (state === "running") {
    return createCircle(
      "bg-blue-200 text-blue-800 dark:bg-blue-400",
      Loader,
      "animate-spin",
    );
  }
  if (state === "skipped") {
    return createCircle(
      "bg-gray-200 text-gray-800 dark:bg-gray-400",
      CircleOff,
    );
  }
  return createCircle(
    "bg-violet-200 text-violet-800 dark:bg-gray-400",
    CircleDotDashed,
  );
}

function createCircle(
  className: string,
  Icon: React.FC<{ className?: string }>,
  iconClassName?: string,
) {
  return (
    <div
      className={cn(
        className,
        "w-6 h-6 rounded-full flex items-center justify-center",
      )}
    >
      <Icon className={cn("w-3 h-3", iconClassName)} />
    </div>
  );
}
