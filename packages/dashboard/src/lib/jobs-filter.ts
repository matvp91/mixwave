import type { JobsFilterData } from "@/components/types";
import type { Job } from "@/api";

export function filterJobs(jobs: Job[], filter: JobsFilterData) {
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

  if (filter.state) {
    jobs = jobs.filter((job) => job.state === filter.state);
  }

  return jobs;
}
