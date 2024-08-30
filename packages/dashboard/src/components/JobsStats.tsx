import { cn } from "@/lib/utils";
import type { JobDto } from "@/tsr";

type JobsStatsProps = {
  jobs: JobDto[];
};

export function JobsStats({ jobs }: JobsStatsProps) {
  let completed = 0;
  let failed = 0;
  let running = 0;
  let waiting = 0;

  for (const job of jobs) {
    if (job.state === "completed") {
      completed += 1;
    }
    if (job.state === "running") {
      running += 1;
    }
    if (job.state === "failed") {
      failed += 1;
    }
    if (job.state === "waiting") {
      waiting += 1;
    }
  }

  return (
    <ul className="flex bg-white border border-border rounded-md overflow-hidden">
      <Tile
        value={completed}
        className="bg-emerald-400"
        outerClassName="border-r border-border"
      />
      <Tile
        value={failed}
        className="bg-red-400"
        outerClassName="border-r border-border"
      />
      <Tile
        value={running}
        className="bg-blue-400"
        outerClassName="border-r border-border"
      />
      <Tile value={waiting} className="bg-violet-400" />
    </ul>
  );
}

function Tile({
  value,
  className,
  outerClassName,
}: {
  value: number;
  className: string;
  outerClassName?: string;
}) {
  return (
    <li
      className={cn(
        "flex items-center justify-center w-10 h-10 bg-white text-xs font-medium",
        outerClassName,
      )}
    >
      {value}
      <div className={cn("ml-1 w-2 h-2 rounded-full", className)} />
    </li>
  );
}
