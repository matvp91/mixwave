import * as z from "zod";
import { Base64 } from "js-base64";

export const playlistParamsSchema = z.object({
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

export function createPlaylistParamsPayload(params: PlaylistParams) {
  return Base64.encode(JSON.stringify(params));
}

export function parsePlaylistParamsPayload(value?: string): PlaylistParams {
  if (!value) {
    return {};
  }
  const result = playlistParamsSchema.safeParse(
    JSON.parse(Base64.decode(value)),
  );
  return result.success ? result.data : {};
}
