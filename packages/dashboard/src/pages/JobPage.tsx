import { Link, useParams } from "react-router-dom";
import { JobTree } from "@/components/JobTree";
import { JobView } from "@/components/JobView";
import { getShortId } from "@/lib/helpers";
import { useJob } from "@/hooks/useJob";
import { Loader } from "@/components/Loader";
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
      <div className="h-14 border-b flex px-4 items-center">
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
      </div>
      <div className="flex grow">
        <div className="px-4 py-2 border-r min-w-[300px]">
          <JobTree job={rootJob} activeId={id!} depth={0} />
        </div>
        <div className="overflow-auto p-4 grow">
          <JobView job={job} />
        </div>
      </div>
    </>
  );
}
