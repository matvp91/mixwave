import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { JobsList } from "@/components/JobsList";
import { JobsFilter } from "@/components/JobsFilter";
import { useJobsFilter } from "@/hooks/useJobsFilter";
import { JobsStats } from "@/components/JobsStats";
import { filterJobs } from "@/lib/jobs-filter";
import { Loader } from "@/components/Loader";

export function JobsPage() {
  const [filter, setFilter] = useJobsFilter();

  const { data } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const result = await api.jobs.get();
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
    refetchInterval: 2000,
  });

  if (!data) {
    return <Loader className="min-h-44" />;
  }

  const filteredJobs = filterJobs(data, filter);

  return (
    <>
      <div className="h-14 border-b flex px-4">
        <div className="flex gap-2 items-center w-full">
          <JobsStats jobs={data} filter={filter} onChange={setFilter} />
          <div className="ml-auto">
            <JobsFilter allJobs={data} filter={filter} onChange={setFilter} />
          </div>
        </div>
      </div>
      <div className="p-4 grow basis-0 overflow-auto">
        <div className="max-w-2xl w-full mx-auto">
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
