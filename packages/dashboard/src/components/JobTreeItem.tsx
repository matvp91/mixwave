import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { JobState } from "./JobState";
import { getDurationStr } from "@/lib/helpers";
import type { JobDto } from "@/tsr";

type JobTreeItemProps = {
  job: JobDto;
  activeId: string;
};

export function JobTreeItem({ job, activeId }: JobTreeItemProps) {
  const durationStr = getDurationStr(job.duration);

  return (
    <Link
      to={`/jobs/${job.id}`}
      className={cn(
        "p-2 flex gap-2 items-center",
        activeId === job.id && "bg-gray-200 rounded-md",
      )}
    >
      <JobState state={job.state} />
      {job.name}
      {durationStr ? (
        <span className="font-medium text-xs">{durationStr}</span>
      ) : null}
    </Link>
  );
}
