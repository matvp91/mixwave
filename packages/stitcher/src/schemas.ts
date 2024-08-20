import * as z from "zod";

export const playlistParamsSchema = z.object({
  assetId: z.string(),
  interstitials: z
    .array(
      z.object({
        offset: z.coerce.number(),
        assetId: z.string(),
      }),
    )
    .optional(),
});

export type PlaylistParams = z.infer<typeof playlistParamsSchema>;
