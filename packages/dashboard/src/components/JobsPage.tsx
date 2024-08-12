import { useJobs } from "@/hooks/useJobs";
import { JobsList } from "./JobsList";
import { Container } from "./Container";

export function JobsPage() {
  const { data } = useJobs();
  return (
    <Container className="py-4">
      <h1 className="text-lg font-medium mb-4">Jobs</h1>
      <JobsList jobs={data} />
    </Container>
  );
}
