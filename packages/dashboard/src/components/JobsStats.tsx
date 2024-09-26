import { TooltipProvider } from "@/components/ui/tooltip";
import { JobStatsTile } from "./JobStatsTile";
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

  const filterJobState = (state?: JobDto["state"]) => {
    if (state === filter.state) {
      state = undefined;
    }
    onChange({ state });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex">
        <JobStatsTile
          value={completed}
          className="bg-emerald-400"
          onClick={() => filterJobState("completed")}
          active={filter.state === "completed"}
          tooltip="Completed"
        />
        <JobStatsTile
          value={failed}
          className="bg-red-400"
          onClick={() => filterJobState("failed")}
          active={filter.state === "failed"}
          tooltip="Failed"
        />
        <JobStatsTile
          value={running}
          className="bg-blue-400"
          onClick={() => filterJobState("running")}
          active={filter.state === "running"}
          tooltip="Running"
        />
        <JobStatsTile
          value={waiting}
          className="bg-violet-400"
          onClick={() => filterJobState("waiting")}
          active={filter.state === "waiting"}
          tooltip="Waiting"
        />
      </div>
    </TooltipProvider>
  );
}
