import { JobsList } from "@/components/JobsList";
import { Container } from "@/components/Container";
import { tsr } from "@/tsr";
import { JobsFilter } from "@/components/JobsFilter";
import { useQueryParams } from "@/hooks/useQueryParams";
import { JobsStats } from "@/components/JobsStats";
import { filterJobs } from "@/lib/jobs-filter";
import { StretchLoader } from "@/components/StretchLoader";
import type { JobsFilterData } from "@/components/types";

export function JobsPage() {
  const [filter, setFilter] = useQueryParams<JobsFilterData>({});

  const { data } = tsr.getJobs.useQuery({
    queryKey: ["jobs"],
    refetchInterval: 2000,
  });

  if (!data) {
    return <StretchLoader />;
  }

  const filteredJobs = filterJobs(data.body, filter);

  return (
    <Container className="py-4">
      <h1 className="text-lg font-medium">Jobs</h1>
      <div className="my-4 flex items-center">
        <JobsStats jobs={filteredJobs} />
        <div className="ml-auto">
          <JobsFilter
            allJobs={data.body}
            filter={filter}
            onChange={setFilter}
          />
        </div>
      </div>
      <JobsList jobs={filteredJobs} />
    </Container>
  );
}
