import { apiClient } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useJob(id: string) {
  return useSuspenseQuery({
    queryKey: ["jobs", id],
    queryFn: async ({ queryKey }) => {
      const response = await apiClient.getJob({
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
