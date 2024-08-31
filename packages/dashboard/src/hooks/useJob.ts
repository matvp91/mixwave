import { tsr } from "@/tsr";
import { useEffect, useRef } from "react";
import type { JobDto } from "@/tsr";

export function useJob(id: string) {
  const lastResultRef = useRef<JobDto>();

  const { data } = tsr.getJob.useQuery({
    queryKey: ["jobsFromRoot", id],
    queryData: { params: { id }, query: { fromRoot: true } },
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (data) {
      lastResultRef.current = data.body;
    }
  }, [data]);

  const rootJob = data?.body ?? lastResultRef.current;
  if (!rootJob) {
    return null;
  }

  const job = findJob(rootJob, id);

  return { job, rootJob };
}

function findJob(job: JobDto, id: string): JobDto | null {
  if (job.id === id) {
    return job;
  }
  for (const childJob of job.children) {
    const result = findJob(childJob, id);
    if (result) {
      return result;
    }
  }
  return null;
}
