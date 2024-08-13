import { useJobLogs } from "@/hooks/useJobLogs";

type JobLogsProps = {
  id: string;
};

export function JobLogs({ id }: JobLogsProps) {
  const { data } = useJobLogs(id);

  return (
    <ul className="flex flex-col gap-2 text-xs">
      {data.map((it, index) => (
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
