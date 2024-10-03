import { stringify } from "./parser/index.js";
import {
  addInterstitialsToMedia,
  fetchPlaylistDuration,
  Presentation,
} from "./presentation/index.js";
import { formatUri } from "./uri.js";
import { assert } from "./assert.js";
import type { Session } from "./types.js";

export async function formatMasterPlaylist(session: Session) {
  const presentation = new Presentation(session.uri, {
    filter: session.filter,
  });

  const master = await presentation.getMaster();

  return stringify(master);
}

export async function formatMediaPlaylist(session: Session, path: string) {
  const presentation = new Presentation(session.uri, {
    filter: session.filter,
  });

  const media = await presentation.getMedia(path);

  if (session.interstitials) {
    addInterstitialsToMedia(media, session.interstitials, session.id);
  }

  return stringify(media);
}

export async function formatAssetList(session: Session, timeOffset: number) {
  assert(session.interstitials);

  const interstitials = session.interstitials.filter(
    (ad) => ad.timeOffset === timeOffset,
  );

  const assets = await Promise.all(
    interstitials.map(async (interstitial) => {
      const format = formatUri(interstitial.uri);

      return {
        URI: format.url,
        DURATION: await fetchPlaylistDuration(format.url),
        "MIX-TYPE": interstitial.type,
      };
    }),
  );

  return { ASSETS: assets };
}
