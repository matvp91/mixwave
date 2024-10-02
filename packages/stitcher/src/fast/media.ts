import * as hlsParser from "../../extern/hls-parser/index.js";
import { formatUri, withPath } from "../uri.js";
import { MediaPlaylist, Segment } from "../../extern/hls-parser/types.js";
import type { ChannelBlock } from "./channel-block.js";
import type { TrackTemplate } from "./channel.js";
import type { DateTime } from "luxon";

export async function getMediaPlaylist(
  block: ChannelBlock,
  template: TrackTemplate,
) {
  const masterFormat = formatUri(block.uri);

  let path: string | undefined;
  if (template.type === "video") {
    path = block.master.variants[0].uri;
  }
  if (template.type === "audio") {
    path = block.master.variants[0].audio[0].uri;
  }

  if (!path) {
    throw new Error("Missing path");
  }

  const url = withPath(masterFormat.base, path);
  const format = formatUri(url);

  const response = await fetch(url);
  const text = await response.text();

  const media = hlsParser.parse(text) as MediaPlaylist;

  media.segments.forEach((segment) => {
    if (segment.map?.uri === "init.mp4") {
      segment.map.uri = withPath(format.base, segment.map.uri);
    }
    segment.uri = withPath(format.base, segment.uri);
  });

  return media;
}

export function mergeMediaPairs(
  now: DateTime,
  slidingLength: number,
  mediaPairs: {
    block: ChannelBlock;
    media: MediaPlaylist;
  }[],
) {
  let targetDuration = 0;

  const allSegments: Segment[] = [];

  for (const { block, media } of mediaPairs) {
    let prevSegmentDuration = 0;

    if (media.targetDuration > targetDuration) {
      targetDuration = media.targetDuration;
    }

    media.segments.forEach((segment, index) => {
      const startTime = block.start.plus({ seconds: prevSegmentDuration });

      if (startTime > now) {
        return;
      }

      const endTime = startTime.plus({ seconds: segment.duration });
      if (endTime < now.minus({ seconds: slidingLength })) {
        return;
      }

      const partialSegment = new Segment({
        uri: segment.uri,
        duration: segment.duration,
        map: segment.map,
      });

      if (!index) {
        partialSegment.discontinuity = true;
      }

      allSegments.push(partialSegment);

      prevSegmentDuration += segment.duration;
    });
  }

  return new MediaPlaylist({
    version: 6,
    targetDuration,
    segments: allSegments,
  });
}
