import type { JobsFilterData } from "@/components/types";
import type { JobDto } from "@/tsr";

export function filterJobs(jobs: JobDto[], filter: JobsFilterData) {
  if (filter.tag) {
    jobs = jobs.filter((job) => {
      if (filter.tag === "none") {
        return job.tag === null;
      }
      return job.tag === filter.tag;
    });
  }

  if (filter.name) {
    jobs = jobs.filter((job) => job.name === filter.name);
  }

  return jobs;
}
