import { Link, useParams } from "react-router-dom";
import { JobTree } from "@/components/JobTree";
import { JobView } from "@/components/JobView";
import { getShortId } from "@/lib/helpers";
import { useJob } from "@/hooks/useJob";
import { Loader } from "@/components/Loader";
import { JobTag } from "@/components/JobTag";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function JobPage() {
  const { id } = useParams() as { id: string };
  const result = useJob(id);

  if (!result) {
    return <Loader className="min-h-44" />;
  }

  const { job, rootJob } = result;

  return (
    <>
      <div className="min-h-14 border-b flex px-4 items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/jobs">Jobs</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{getShortId(id)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-4 flex items-center">
          <JobTag tag={job.tag} />
        </div>
      </div>
      <div className="flex grow basis-0 overflow-hidden">
        <div className="px-4 py-2 border-r min-w-[300px] overflow-auto grow">
          <JobTree job={rootJob} activeId={id!} depth={0} />
        </div>
        <div className="overflow-auto p-4 grow">
          <JobView job={job} />
        </div>
      </div>
    </>
  );
}
