import { cn } from "@/lib/utils";
import { JobTreeItem } from "./JobTreeItem";
import type { JobNodeDto } from "@/tsr";

type JobTreeProps = {
  jobNode: JobNodeDto;
  activeId: string;
  depth?: number;
};

export function JobTree({ jobNode, activeId, depth = 0 }: JobTreeProps) {
  return (
    <div className={cn(depth && "ml-4")}>
      <JobTreeItem job={jobNode.job} activeId={activeId} />
      <ul>
        {jobNode.children.map((childJobNode) => (
          <JobTree
            key={childJobNode.job.id}
            jobNode={childJobNode}
            activeId={activeId}
            depth={depth + 1}
          />
        ))}
      </ul>
    </div>
  );
}
