import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { filterJobs } from "@/lib/jobs-filter";
import { JobTag } from "@/components/JobTag";
import type { JobDto } from "@/tsr";
import type { JobsFilterData } from "./types";

type JobsFilterProps = {
  jobs: JobDto[];
  filter: JobsFilterData;
  onChange(value: Partial<JobsFilterData>): void;
};

export function JobsFilter({ jobs, filter, onChange }: JobsFilterProps) {
  const tags = jobs.reduce<string[]>((acc, job) => {
    if (job.tag && !acc.includes(job.tag)) {
      acc.push(job.tag);
    }
    return acc;
  }, []);

  const names = jobs.reduce<string[]>((acc, job) => {
    if (!acc.includes(job.name)) {
      acc.push(job.name);
    }
    return acc;
  }, []);

  const filteredJobs = filterJobs(jobs, filter);

  let tagValue = filter.tag;
  if (tagValue === null) {
    tagValue = "all";
  }

  const onTagChange = (value: string) => {
    const tag = value === "all" ? null : value;
    onChange({ tag });
  };

  let nameValue = filter.name;
  if (nameValue === null) {
    nameValue = "all";
  }

  const onNameChange = (value: string) => {
    const name = value === "all" ? null : value;
    onChange({ name });
  };

  return (
    <div className="flex gap-2">
      <div className="grow flex items-center">{filteredJobs.length} jobs</div>
      <div className="flex gap-2">
        <Select value={nameValue} onValueChange={onNameChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All names</SelectItem>
            {names.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={tagValue} onValueChange={onTagChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag === "default" ? "No tags" : <JobTag tag={tag} />}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
