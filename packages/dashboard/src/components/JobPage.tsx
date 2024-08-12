import { useJob } from "@/hooks/useJob";
import { Link, useParams } from "react-router-dom";
import { JobTree } from "./JobTree";
import { JobView } from "./JobView";
import { Button } from "./ui/button";
import { getShortId } from "@/lib/helpers";

export function JobPage() {
  const { id } = useParams();
  const { data } = useJob(id!);

  return (
    <div className="flex flex-col grow">
      <div className="p-2 border-b border-border">
        <Button asChild variant="ghost">
          <Link to="/jobs">Jobs</Link>
        </Button>
        <span className="mr-3">/</span> {getShortId(data.job.id)}
      </div>
      <div className="flex grow">
        <div className="p-2 border-r border-border min-w-[300px]">
          <JobTree jobNode={data.rootTree} activeId={id!} depth={0} />
        </div>
        <div className="overflow-auto p-4 grow">
          <JobView job={data.job} />
        </div>
      </div>
    </div>
  );
}
