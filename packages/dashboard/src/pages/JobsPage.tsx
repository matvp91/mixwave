import { JobsList } from "@/components/JobsList";
import { Container } from "@/components/Container";
import { tsr } from "@/tsr";
import { JobsFilter } from "@/components/JobsFilter";

export function JobsPage() {
  const { data } = tsr.getJobs.useSuspenseQuery({
    queryKey: ["jobs"],
    refetchInterval: 2000,
  });

  return (
    <Container className="py-4">
      <h1 className="text-lg font-medium">Jobs</h1>
      <div className="my-4">
        <JobsFilter jobs={data.body} />
      </div>
      <JobsList jobs={data.body} />
    </Container>
  );
}
