import { Link, useParams } from "react-router-dom";
import { JobTree } from "@/components/JobTree";
import { JobView } from "@/components/JobView";
import { Button } from "@/components/ui/button";
import { getShortId } from "@/lib/helpers";
import { useJob } from "@/hooks/useJob";

export function JobPage() {
  const { id } = useParams() as { id: string };
  const [job, rootJob] = useJob(id);

  return (
    <div className="min-h-full flex flex-col grow bg-white">
      <div className="p-2 border-b border-border">
        <Button asChild variant="ghost">
          <Link to="/jobs">Jobs</Link>
        </Button>
        <span className="mr-3">/</span> {getShortId(job.id)}
      </div>
      <div className="flex grow">
        <div className="p-2 border-r border-border min-w-[300px]">
          <JobTree job={rootJob} activeId={id!} depth={0} />
        </div>
        <div className="overflow-auto p-4 grow">
          <JobView job={job} />
        </div>
      </div>
    </div>
  );
}
