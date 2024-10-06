import { DateRange, stringify } from "./parser/index.js";
import { fetchPlaylistDuration, Presentation } from "./presentation/index.js";
import { assert } from "./assert.js";
import { filterMaster } from "./filters.js";
import { fetchVmap } from "./vmap.js";
import { formatAdBreaksToDateRanges } from "./vmap.js";
import { DateTime } from "luxon";
import { getAdMediasFromVast } from "./vast.js";
import { getSession, updateSession } from "./session.js";
import { getMasterUrl } from "./url.js";
import type { InterstitialAsset } from "./types.js";

export async function formatMasterPlaylist(sessionId: string) {
  const session = await getSession(sessionId);

  const presentation = new Presentation(session.uri);

  const master = await presentation.getMaster();

  if (session.vmap || session.interstitials?.length) {
    session.programDateTime = DateTime.now().toISO();

    if (session.vmap) {
      session.vmapResponse = await fetchVmap(session.vmap.url);
    }

    await updateSession(session);
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

  const dateRanges: DateRange[] = [];

  if (session.vmapResponse || session.interstitials?.length) {
    assert(session.programDateTime);

    const programDateTime = DateTime.fromISO(session.programDateTime);
    media.segments[0].programDateTime = programDateTime;

    // TODO: Let's not work with dateRanges here, they're a bit complex to properly merge.
    // Define an |Interstitial| type that we can parse to a dateRange indicating an interstitial.
    if (session.vmapResponse) {
      dateRanges.push(
        ...formatAdBreaksToDateRanges(
          programDateTime,
          session.vmapResponse,
          session.id,
        ),
      );
    }

    // session.interstitials?.forEach((interstitial) => {
    //   dateRanges.push({
    //     classId: "com.apple.hls.interstitial",
    //     id: `manual(${interstitial.timeOffset})`,
    //     startDate: programDateTime.plus({ seconds: interstitial.timeOffset }),
    //     clientAttributes: {},
    //   });
    // });
  }

  media.dateRanges = dateRanges;

  return stringify(media);
}

export async function formatAssetList(sessionId: string, startDate: string) {
  const assets: InterstitialAsset[] = [];

  const session = await getSession(sessionId);

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
      const adMedias = await getAdMediasFromVast(adBreak);

      for (const adMedia of adMedias) {
        const url = getMasterUrl(adMedia.assetId);
        assets.push({
          URI: url,
          DURATION: await fetchPlaylistDuration(url),
          "MIX-TYPE": "ad",
        });
      }
    }
  }

  return { ASSETS: assets };
}
