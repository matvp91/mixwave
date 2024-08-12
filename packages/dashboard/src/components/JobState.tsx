import { CircleDashed, CircleDotDashed, Loader, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JobDto } from "@/lib/api";

export function JobState({ state }: { state: JobDto["state"] }) {
  switch (state) {
    case "waiting":
      return createCircle("bg-violet-200 text-violet-800", CircleDotDashed);

    case "active":
    case "waiting-children":
      return createCircle("bg-blue-200 text-blue-800", Loader, "animate-spin");

    case "completed":
      return createCircle("bg-emerald-200 text-emerald-800", Check);

    case "failed":
      return createCircle("bg-red-200 text-red-800", X);

    default:
      return createCircle("bg-gray-200 text-gray-800", CircleDashed);
  }
}

function createCircle(
  className: string,
  Icon: React.FC<{ className?: string }>,
  iconClassName?: string
) {
  return (
    <div
      className={cn(
        className,
        "w-6 h-6 rounded-full flex items-center justify-center"
      )}
    >
      <Icon className={cn("w-3 h-3", iconClassName)} />
    </div>
  );
}
