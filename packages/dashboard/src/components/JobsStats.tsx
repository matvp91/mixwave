import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { JobDto } from "@/tsr";
import type { JobsFilterData } from "./types";

type JobsStatsProps = {
  jobs: JobDto[];
  filter: JobsFilterData;
  onChange(value: Partial<JobsFilterData>): void;
};

export function JobsStats({ jobs, filter, onChange }: JobsStatsProps) {
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
    <TooltipProvider delayDuration={0}>
      <ul className="flex bg-white border border-border rounded-md overflow-hidden">
        <Tooltip>
          <TooltipTrigger>
            <Tile
              value={completed}
              className="bg-emerald-400"
              outerClassName="border-r border-border"
              onClick={() => onChange({ state: "completed" })}
              active={filter.state === "completed"}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Completed</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Tile
              value={failed}
              className="bg-red-400"
              outerClassName="border-r border-border"
              onClick={() => onChange({ state: "failed" })}
              active={filter.state === "failed"}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Failed</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Tile
              value={running}
              className="bg-blue-400"
              outerClassName="border-r border-border"
              onClick={() => onChange({ state: "running" })}
              active={filter.state === "running"}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Running</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Tile
              value={waiting}
              className="bg-violet-400"
              onClick={() => onChange({ state: "waiting" })}
              active={filter.state === "waiting"}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Waiting</p>
          </TooltipContent>
        </Tooltip>
      </ul>
    </TooltipProvider>
  );
}

function Tile({
  value,
  className,
  outerClassName,
  onClick,
  active,
}: {
  value: number;
  className: string;
  outerClassName?: string;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <li
      onClick={onClick}
      className={cn(
        "flex items-center justify-center px-2 h-10 text-xs font-medium",
        outerClassName,
        active && "bg-secondary",
      )}
    >
      {value}
      <div className={cn("ml-1 w-2 h-2 rounded-full", className)} />
    </li>
  );
}
