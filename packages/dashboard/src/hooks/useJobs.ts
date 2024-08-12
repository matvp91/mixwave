import { apiClient } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useJobs() {
  return useSuspenseQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const response = await apiClient.getJobs();
      if (response.status !== 200) {
        throw new Error("error");
      }
      return response.body;
    },
    refetchInterval: 2000,
  });
}
