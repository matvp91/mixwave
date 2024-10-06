import { stringify } from "./parser/index.js";
import { fetchPlaylistDuration, Presentation } from "./presentation/index.js";
import { formatUri } from "./uri.js";
import { assert } from "./assert.js";
import { filterMaster } from "./filters.js";
import { fetchVmap } from "./vmap.js";
import { adBreaksToDateRanges } from "./vmap.js";
import { DateTime } from "luxon";
import { getVast } from "./vast.js";
import { updateSession } from "./session.js";
import type { InterstitialType, Session } from "./types.js";

export async function formatMasterPlaylist(session: Session) {
  const presentation = new Presentation(session.uri);

  const master = await presentation.getMaster();

  if (session.vmap) {
    session.programDateTime = DateTime.now().toISO();
    session.vmapResponse = await fetchVmap(session.vmap.url);

    await updateSession(session);
  }

  if (session.filter) {
    filterMaster(master, session.filter);
  }

  return stringify(master);
}

export async function formatMediaPlaylist(session: Session, path: string) {
  const presentation = new Presentation(session.uri);

  const media = await presentation.getMedia(path);

  if (session.vmapResponse) {
    assert(session.programDateTime);

    const programDateTime = DateTime.fromISO(session.programDateTime);
    media.segments[0].programDateTime = programDateTime;

    media.dateRanges = adBreaksToDateRanges(
      programDateTime,
      session.vmapResponse,
      session.id,
    );
  }

  return stringify(media);
}

export async function formatAssetList(session: Session, startDate: string) {
  const assets: {
    URI: string;
    DURATION: number;
    "MIX-TYPE": InterstitialType;
  }[] = [];

  if (session.vmapResponse) {
    assert(session.programDateTime);

    const { programDateTime } = session;

    const adBreak = session.vmapResponse.adBreaks.find((it) => {
      return (
        DateTime.fromISO(programDateTime)
          .plus({ seconds: it.timeOffset })
          .toISO() === startDate
      );
    });

    if (adBreak) {
      const adMedias = await getVast(adBreak);

      for (const adMedia of adMedias) {
        const format = formatUri(adMedia.assetId);
        assets.push({
          URI: format.url,
          DURATION: await fetchPlaylistDuration(format.url),
          "MIX-TYPE": "ad",
        });
      }
    }
  }

  return { ASSETS: assets };
}
