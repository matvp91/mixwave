import { tsr } from "@/tsr";

type JobLogsProps = {
  id: string;
};

export function JobLogs({ id }: JobLogsProps) {
  const { data } = tsr.getJobLogs.useSuspenseQuery({
    queryKey: ["jobs", id, "logs"],
    queryData: { params: { id } },
    refetchInterval: 2000,
  });
  const logs = data.body;

  return (
    <ul className="flex flex-col gap-2 text-xs">
      {logs.map((it, index) => (
        <li
          key={index}
          className="border border-border rounded-md p-2 break-all flex"
        >
          <div className="mr-2 font-medium">{index + 1}</div>
          <div>{it}</div>
        </li>
      ))}
    </ul>
  );
}
