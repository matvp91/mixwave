import { JobsList } from "@/components/JobsList";
import { Container } from "@/components/Container";
import { tsr } from "@/tsr";
import { JobsFilter } from "@/components/JobsFilter";
import { useJobsFilter } from "@/hooks/useJobsFilter";
import { JobsStats } from "@/components/JobsStats";
import { filterJobs } from "@/lib/jobs-filter";
import { StretchLoader } from "@/components/StretchLoader";
import cookieSvg from "@/assets/cookie.svg";

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
    <Container className="py-4">
      <h1 className="text-lg font-medium">Jobs</h1>
      <div className="my-4 flex items-center">
        <JobsStats jobs={data.body} filter={filter} onChange={setFilter} />
        <div className="ml-auto">
          <JobsFilter
            allJobs={data.body}
            filter={filter}
            onChange={setFilter}
          />
        </div>
      </div>
      {filteredJobs.length ? (
        <JobsList jobs={filteredJobs} />
      ) : (
        <div className="py-4 flex justify-center">
          <div className="flex flex-col gap-2 items-center text-muted-foreground">
            <img className="w-12" src={cookieSvg} />
            <p>There's no jobs here</p>
          </div>
        </div>
      )}
    </Container>
  );
}
