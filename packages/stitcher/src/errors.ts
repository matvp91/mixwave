import { createError } from "@fastify/error";

export const SessionNotFoundError = createError(
  "SESSION_NOT_FOUND",
  'No session found with id "%s".',
  404,
);

export const UriInvalidError = createError(
  "URI_INVALID",
  'Not a valid uri "%s".',
  400,
);

export const FilterResolutionInvalidError = createError(
  "FILTER_RESOLUTION_INVALID",
  'Resolution filter with value "%s" is invalid.',
  400,
);

export const PlaylistNoVariants = createError(
  "PLAYLIST_NO_VARIANTS",
  "The playlist has no variants.",
  400,
);
