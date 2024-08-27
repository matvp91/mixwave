import { JobsList } from "@/components/JobsList";
import { Container } from "@/components/Container";
import { tsr } from "@/tsr";
import { JobsFilter } from "@/components/JobsFilter";
import { useState } from "react";
import type { JobsFilterData } from "@/components/types";

export function JobsPage() {
  const { data } = tsr.getJobs.useSuspenseQuery({
    queryKey: ["jobs"],
    refetchInterval: 2000,
  });

  const [filter, setFilter] = useState<JobsFilterData>({
    tag: null,
  });

  return (
    <Container className="py-4">
      <h1 className="text-lg font-medium">Jobs</h1>
      <div className="my-4">
        <JobsFilter jobs={data.body} filter={filter} onChange={setFilter} />
      </div>
      <JobsList jobs={data.body} filter={filter} />
    </Container>
  );
}
