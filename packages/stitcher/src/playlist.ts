import { stringify } from "./parser/index.js";
import { Presentation } from "./presentation/index.js";
import { filterMaster } from "./filters.js";
import { fetchVmap } from "./vmap.js";
import { DateTime } from "luxon";
import { getSession, updateSession } from "./session.js";
import { formatDateRanges, getAssets } from "./interstitials.js";

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

  return stringify(master);
}

export async function formatMediaPlaylist(sessionId: string, path: string) {
  const session = await getSession(sessionId);

  const presentation = new Presentation(session.uri);

  const { type, playlist } = await presentation.getMedia(path);

  if (playlist.endlist) {
    // Only when we have an endlist, we can add these type of dateRanges,
    // when we're live, we can use the EXT-X-PROGRAM-DATE-TIME from the source.
    playlist.segments[0].programDateTime = session.startDate;

    if (type === "video") {
      playlist.dateRanges = formatDateRanges(session);
    }
  }

  return stringify(playlist);
}

export async function formatAssetList(sessionId: string, startDate: string) {
  const session = await getSession(sessionId);

  const lookupDate = DateTime.fromISO(startDate);
  const assets = await getAssets(session, lookupDate);

  return { ASSETS: assets };
}
