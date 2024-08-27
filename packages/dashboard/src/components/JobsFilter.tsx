import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JobDto } from "@/tsr";

type JobsFilterProps = {
  jobs: JobDto[];
};

export function JobsFilter({ jobs }: JobsFilterProps) {
  const tags = jobs.reduce<string[]>((acc, job) => {
    if (job.tag && !acc.includes(job.tag)) {
      acc.push(job.tag);
    }
    return acc;
  }, []);

  return (
    <div className="flex gap-2">
      <div className="grow" />
      <div className="flex">
        <Select>
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
