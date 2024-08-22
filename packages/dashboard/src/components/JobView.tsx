import { getTimeAgo } from "@/lib/helpers";
import { JobLogs } from "./JobLogs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { JobDto } from "@/lib/api";

type JobViewProps = {
  job: JobDto;
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
          <div className="text-sm font-medium">Started</div>
          {getTimeAgo(job.processedOn) ?? "N/A"}
        </div>
        <div>
          <div className="text-sm font-medium">Finished</div>
          {getTimeAgo(job.finishedOn) ?? "N/A"}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="mb-4">
            <div className="mb-2">Input</div>
            <Format data={job.inputData} />
          </div>
          <div>
            <div className="mb-2">Output</div>
            <Format data={job.outputData} />
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

function Format({ data }: { data: string | null }) {
  let parsedData: unknown;
  try {
    if (data) {
      parsedData = JSON.parse(data);
    }
  } catch {}

  return parsedData ? (
    <pre className="p-2 text-xs border border-border rounded-md whitespace-pre-wrap break-all">
      {JSON.stringify(parsedData, null, 2)}
    </pre>
  ) : null;
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
