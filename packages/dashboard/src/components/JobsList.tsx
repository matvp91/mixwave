import { Link } from "react-router-dom";
import { JobState } from "./JobState";
import { getShortId, getTimeAgo } from "@/lib/helpers";
import { JobTag } from "./JobTag";
import type { JobDto } from "@/tsr";

type JobsListProps = {
  jobs: JobDto[];
};

export function JobsList({ jobs }: JobsListProps) {
  return (
    <ul>
      {jobs.map((job) => (
        <li key={job.id} className="mb-2">
          <Link
            to={`/jobs/${job.id}`}
            className="p-4 border border-border rounded-md block"
          >
            <div className="grid grid-cols-2 gap-2 items-center">
              <div className="flex items-center gap-4">
                <JobState state={job.state} />
                <div>
                  <div className="text-xs">{getShortId(job.id)}</div>
                  {job.name}
                </div>
              </div>
              <div className="text-right">
                <JobTag job={job} />
                <div className="text-sm text-muted-foreground">
                  {getTimeAgo(job.createdOn)}
                </div>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
