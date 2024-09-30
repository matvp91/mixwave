import { tsr } from "@/tsr";
import { useEffect } from "react";
import type { JobDto } from "@/tsr";

export function useJob(id: string) {
  const queryClient = tsr.useQueryClient();

  const { data } = tsr.getJob.useQuery({
    queryKey: ["jobsFromRoot", id],
    queryData: { params: { id }, query: { fromRoot: true } },
    refetchInterval: 2000,
  });

  useEffect(() => {
    const populateCache = (root: typeof data, jobs: JobDto[]) => {
      jobs.forEach((job) => {
        if (job.id !== id) {
          queryClient.setQueryData(["jobsFromRoot", job.id], root);
        }
        populateCache(root, job.children);
      });
    };

    if (data?.status === 200) {
      populateCache(data, [data.body]);
    }
  }, [data, queryClient, id]);

  const rootJob = data?.body;

  if (!rootJob) {
    return null;
  }

  const job = findJob(rootJob, id);
  if (!job) {
    throw new Error("Job not found in tree");
  }

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
