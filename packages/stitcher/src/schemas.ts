import * as z from "zod";

export const playlistParamsSchema = z.object({
  url: z.string(),
  interstitials: z
    .array(
      z.object({
        offset: z.coerce.number(),
        url: z.string(),
      }),
    )
    .optional(),
  vmapUrl: z.string().optional(),
});

export type PlaylistParams = z.infer<typeof playlistParamsSchema>;
