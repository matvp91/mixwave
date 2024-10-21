import { getTimeAgo } from "@/lib/helpers";
import { JobLogs } from "./JobLogs";
import AlertCircle from "lucide-react/icons/alert-circle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getDurationStr } from "@/lib/helpers";
import { JsonHighlight } from "./JsonHighlight";
import type { Job } from "@/api";

type JobViewProps = {
  job: Job;
};

export function JobView({ job }: JobViewProps) {
  return (
    <>
      {job.failedReason ? <JobError error={job.failedReason} /> : null}
      <div className="grid grid-cols-3 gap-2 w-full mb-4">
        <div>
          <div className="text-sm font-medium">Created</div>
          {getTimeAgo(job.createdOn)}
        </div>
        <div>
          <div className="text-sm font-medium">Duration</div>
          {getDurationStr(job.duration) ?? "N/A"}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="mb-4">
            <div className="mb-2">Input</div>
            <JsonHighlight json={job.inputData} />
          </div>
          <div>
            <div className="mb-2">Output</div>
            {job.outputData ? <JsonHighlight json={job.outputData} /> : null}
          </div>
        </div>
        <div>
          <div className="mb-2">Logs</div>
          <JobLogs id={job.id} />
        </div>
      </div>
    </>
  );
}

function JobError({ error }: { error: string }) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Failed</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
