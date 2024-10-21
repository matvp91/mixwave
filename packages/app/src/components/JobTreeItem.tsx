import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { JobState } from "./JobState";
import { getDurationStr } from "@/lib/helpers";
import type { Job } from "@/api";

type JobTreeItemProps = {
  job: Job;
  activeId: string;
};

export function JobTreeItem({ job, activeId }: JobTreeItemProps) {
  const durationStr = getDurationStr(job.duration);

  return (
    <Link
      to={`/jobs/${job.id}`}
      className={cn(
        "px-3 py-2 flex gap-3 items-center rounded-lg text-muted-foreground transition-all hover:text-primary text-sm",
        activeId === job.id && "bg-muted text-primary",
      )}
    >
      <JobState state={job.state} />
      {job.name}
      {durationStr ? <span className="text-xs">{durationStr}</span> : null}
    </Link>
  );
}
