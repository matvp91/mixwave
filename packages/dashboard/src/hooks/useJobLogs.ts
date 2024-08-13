import { apiClient } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useJobLogs(id: string) {
  return useSuspenseQuery({
    queryKey: ["jobs", id, "logs"],
    queryFn: async ({ queryKey }) => {
      const response = await apiClient.getJobLogs({
        params: { id: queryKey[1] },
      });
      if (response.status !== 200) {
        throw new Error("error");
      }
      return response.body;
    },
    refetchInterval: 2000,
  });
}
