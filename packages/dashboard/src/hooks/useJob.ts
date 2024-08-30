import { tsr } from "@/tsr";
import type { JobDto } from "@/tsr";

export function useJob(id: string) {
  const { data: jobData } = tsr.getJob.useSuspenseQuery({
    queryKey: ["jobsFromRoot", id],
    queryData: { params: { id }, query: { fromRoot: true } },
    refetchInterval: 2000,
  });

  const rootJob = jobData.body;
  const job = findJob(rootJob, id);
  if (!job) {
    throw new Error("Job not found in tree.");
  }

  return [job, rootJob] as const;
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
