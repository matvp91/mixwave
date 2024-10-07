import { stringify } from "./parser/index.js";
import { Presentation } from "./presentation.js";
import { filterMaster } from "./filters.js";
import { fetchVmap } from "./vmap.js";
import { DateTime } from "luxon";
import { getSession, updateSession } from "./session.js";
import {
  getStaticDateRanges,
  getAssets,
  getStaticPDT,
} from "./interstitials.js";
import { PlaylistNoVariants } from "./errors.js";

export async function formatMasterPlaylist(sessionId: string) {
  const session = await getSession(sessionId);

  const presentation = new Presentation(session.uri);

  const master = await presentation.getMaster();

  if (session.vmap) {
    session.vmapResponse = await fetchVmap(session.vmap.url);
    updateSession(session);
  }

  if (session.filter) {
    filterMaster(master, session.filter);
  }

  if (!master.variants.length) {
    throw new PlaylistNoVariants();
  }

  return stringify(master);
}

export async function formatMediaPlaylist(sessionId: string, path: string) {
  const session = await getSession(sessionId);

  const presentation = new Presentation(session.uri);

  const { mediaType, media } = await presentation.getMedia(path);

  if (mediaType === "video" && media.endlist) {
    // When we have an endlist, the playlist is static. We can check whether we need
    // to add dateRanges.
    media.segments[0].programDateTime = getStaticPDT(session);
    media.dateRanges = getStaticDateRanges(session);
  }

  return stringify(media);
}

export async function formatAssetList(sessionId: string, startDate: string) {
  const session = await getSession(sessionId);

  const lookupDate = DateTime.fromISO(startDate);
  const assets = await getAssets(session, lookupDate);

  return { ASSETS: assets };
}
