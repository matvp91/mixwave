import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";

type JobLogsProps = {
  id: string;
};

export function JobLogs({ id }: JobLogsProps) {
  const { data } = useQuery({
    queryKey: ["jobs", id, "logs"],
    queryFn: async ({ queryKey }) => {
      const result = await api.jobs({ id: queryKey[1] }).logs.get();
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
    refetchInterval: 2000,
  });

  const logs = data ?? [];

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
