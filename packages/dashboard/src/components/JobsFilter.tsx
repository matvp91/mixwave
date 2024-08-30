import { JobTag } from "@/components/JobTag";
import { ObjSelect } from "./ObjSelect";
import type { JobDto } from "@/tsr";
import type { JobsFilterData } from "./types";
import type { ObjSelectItem } from "./ObjSelect";

type JobsFilterProps = {
  allJobs: JobDto[];
  filter: JobsFilterData;
  onChange(value: Partial<JobsFilterData>): void;
};

export function JobsFilter({ allJobs, filter, onChange }: JobsFilterProps) {
  const tags = getTags(allJobs).map<ObjSelectItem>((tag) => ({
    value: tag,
    label: <JobTag tag={tag} />,
  }));

  tags.unshift(
    { value: undefined, label: "All tags" },
    { value: "none", label: "No tags" },
  );

  const names = getNames(allJobs).map<ObjSelectItem>((name) => ({
    value: name,
    label: name,
  }));

  names.unshift({ value: undefined, label: "All names" });

  return (
    <div className="flex gap-2">
      <ObjSelect
        items={names}
        value={filter.name}
        onChange={(name) => onChange({ name })}
      />
      <ObjSelect
        items={tags}
        value={filter.tag}
        onChange={(tag) => onChange({ tag })}
      />
    </div>
  );
}

function getTags(jobs: JobDto[]) {
  return jobs.reduce<string[]>((acc, job) => {
    if (job.tag && !acc.includes(job.tag)) {
      acc.push(job.tag);
    }
    return acc;
  }, []);
}

function getNames(jobs: JobDto[]) {
  return jobs.reduce<string[]>((acc, job) => {
    if (!acc.includes(job.name)) {
      acc.push(job.name);
    }
    return acc;
  }, []);
}
