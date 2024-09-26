import { JobsList } from "@/components/JobsList";
import { tsr } from "@/tsr";
import { JobsFilter } from "@/components/JobsFilter";
import { useJobsFilter } from "@/hooks/useJobsFilter";
import { JobsStats } from "@/components/JobsStats";
import { filterJobs } from "@/lib/jobs-filter";
import { StretchLoader } from "@/components/StretchLoader";

export function JobsPage() {
  const [filter, setFilter] = useJobsFilter();

  const { data } = tsr.getJobs.useQuery({
    queryKey: ["jobs"],
    refetchInterval: 2000,
  });

  if (!data) {
    return <StretchLoader />;
  }

  const filteredJobs = filterJobs(data.body, filter);

  return (
    <>
      <div className="h-14 border-b flex px-4">
        <div className="container flex gap-2 h-14 items-center">
          <JobsStats jobs={data.body} filter={filter} onChange={setFilter} />
          <div className="ml-auto">
            <JobsFilter
              allJobs={data.body}
              filter={filter}
              onChange={setFilter}
            />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="container">
          {filteredJobs.length ? (
            <JobsList jobs={filteredJobs} />
          ) : (
            <p className="text-center">No jobs found...</p>
          )}
        </div>
      </div>
    </>
  );
}
