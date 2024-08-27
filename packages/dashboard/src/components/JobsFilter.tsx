import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JobDto } from "@/tsr";
import type { JobsFilterData } from "./types";

type JobsFilterProps = {
  jobs: JobDto[];
  filter: JobsFilterData;
  onChange(value: JobsFilterData): void;
};

export function JobsFilter({ jobs, filter, onChange }: JobsFilterProps) {
  const tags = jobs.reduce<string[]>((acc, job) => {
    if (job.tag && !acc.includes(job.tag)) {
      acc.push(job.tag);
    }
    return acc;
  }, []);

  const onSelectTag = (tag: string) => {
    onChange({ ...filter, tag });
  };

  return (
    <div className="flex gap-2">
      <div className="grow" />
      <div className="flex">
        <Select onValueChange={onSelectTag}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            {tags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
