import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JobDto } from "@/tsr";
import type { JobsFilterData } from "./types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { filterJobs } from "@/lib/jobs-filter";

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

  const filteredJobs = filterJobs(jobs, filter);

  return (
    <div className="flex gap-2">
      <div className="grow flex items-center">{filteredJobs.length} jobs</div>
      <div className="flex">
        {filter.tag ? (
          <div className="h-10 flex items-center">
            {filter.tag}
            <Button
              variant="secondary"
              className="ml-2"
              size="icon"
              onClick={() => onChange({ tag: null })}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Select onValueChange={(tag) => onChange({ tag })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select tag" />
            </SelectTrigger>
            <SelectContent>
              {tags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
