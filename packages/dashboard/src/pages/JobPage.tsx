import { Link, useParams } from "react-router-dom";
import { JobTree } from "@/components/JobTree";
import { JobView } from "@/components/JobView";
import { Button } from "@/components/ui/button";
import { getShortId } from "@/lib/helpers";
import { tsr } from "@/tsr";

export function JobPage() {
  const { id } = useParams() as { id: string };
  const { data } = tsr.getJob.useSuspenseQuery({
    queryKey: ["jobs", id],
    queryData: { params: { id } },
    refetchInterval: 2000,
  });
  const { job, rootTree } = data.body;

  return (
    <div className="flex flex-col grow">
      <div className="p-2 border-b border-border">
        <Button asChild variant="ghost">
          <Link to="/jobs">Jobs</Link>
        </Button>
        <span className="mr-3">/</span> {getShortId(job.id)}
      </div>
      <div className="flex grow">
        <div className="p-2 border-r border-border min-w-[300px]">
          <JobTree jobNode={rootTree} activeId={id!} depth={0} />
        </div>
        <div className="overflow-auto p-4 grow">
          <JobView job={job} />
        </div>
      </div>
    </div>
  );
}
