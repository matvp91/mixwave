import type { JobsFilterData } from "@/components/types";
import type { JobDto } from "@/tsr";

export function filterJobs(jobs: JobDto[], filter: JobsFilterData) {
  if (filter.tag) {
    jobs = jobs.filter((job) => job.tag === filter.tag);
  }

  return jobs;
}
