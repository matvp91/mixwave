import { stringify } from "./parser/index.js";
import { Presentation } from "./presentation/index.js";
import { filterMaster } from "./filters.js";
import { fetchVmap } from "./vmap.js";
import { DateTime } from "luxon";
import { getSession, updateSession } from "./session.js";
import {
  formatDateRanges,
  getAssets,
  needsProgramDateTime,
} from "./interstitials.js";

export async function formatMasterPlaylist(sessionId: string) {
  const session = await getSession(sessionId);

  const presentation = new Presentation(session.uri);

  const master = await presentation.getMaster();

  if (needsProgramDateTime(session)) {
    session.programDateTime = DateTime.now().toISO();

    if (session.vmap) {
      session.vmapResponse = await fetchVmap(session.vmap.url);
    }

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

  const media = await presentation.getMedia(path);

  if (session.programDateTime) {
    media.segments[0].programDateTime = DateTime.fromISO(
      session.programDateTime,
    );
  }

  const dateRanges = formatDateRanges(session);
  if (dateRanges) {
    media.dateRanges = dateRanges;
  }

  return stringify(media);
}

export async function formatAssetList(sessionId: string, startDate: string) {
  const session = await getSession(sessionId);

  const assets = await getAssets(session, startDate);

  return { ASSETS: assets };
}
