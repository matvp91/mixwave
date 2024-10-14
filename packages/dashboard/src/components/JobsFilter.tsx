import { JobTag } from "@/components/JobTag";
import { SelectObject } from "./SelectObject";
import type { Job } from "@/api";
import type { JobsFilterData } from "./types";
import type { SelectObjectItem } from "./SelectObject";

type JobsFilterProps = {
  allJobs: Job[];
  filter: JobsFilterData;
  onChange(value: Partial<JobsFilterData>): void;
};

export function JobsFilter({ allJobs, filter, onChange }: JobsFilterProps) {
  const tags = getTags(allJobs).map<SelectObjectItem>((tag) => ({
    value: tag,
    label: <JobTag tag={tag} />,
  }));

  tags.unshift(
    { value: undefined, label: "All tags" },
    { value: "none", label: "No tags" },
  );

  const names = getNames(allJobs).map<SelectObjectItem>((name) => ({
    value: name,
    label: name,
  }));

  names.unshift({ value: undefined, label: "All names" });

  return (
    <div className="flex gap-2">
      <SelectObject
        items={names}
        value={filter.name}
        onChange={(name) => onChange({ name })}
      />
      <SelectObject
        items={tags}
        value={filter.tag}
        onChange={(tag) => onChange({ tag })}
      />
    </div>
  );
}

function getTags(jobs: Job[]) {
  return jobs.reduce<string[]>((acc, job) => {
    if (job.tag && !acc.includes(job.tag)) {
      acc.push(job.tag);
    }
    return acc;
  }, []);
}

function getNames(jobs: Job[]) {
  return jobs.reduce<string[]>((acc, job) => {
    if (!acc.includes(job.name)) {
      acc.push(job.name);
    }
    return acc;
  }, []);
}
