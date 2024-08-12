import { useSuspenseQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function usePlaylist(assetId: string) {
  return useSuspenseQuery({
    queryKey: ["playlist", assetId],
    queryFn: async () => {
      const response = await apiClient.postPlaylist({
        params: { assetId },
        body: {
          interstitials: [],
        },
      });
      if (response.status !== 200) {
        throw new Error("error");
      }
      return response.body;
    },
  });
}
