import { formatUri } from "./uri.js";
import * as hlsParser from "../extern/hls-parser/index.js";
import {
  MasterPlaylist,
  MediaPlaylist,
  Variant,
  Segment,
} from "../extern/hls-parser/types.js";
import { withPath } from "./uri.js";

// Below is a very minimalistic FAST channel implementation,
// segments are gradually exposed over time in a seekable window.
// Not to be taken seriously, it's a PoC!

const schedule = createSchedule();

export async function getFastMasterPlaylist() {
  const master = new MasterPlaylist({
    independentSegments: true,
    variants: [
      new Variant({
        uri: "playlist.m3u8",
        bandwidth: 8437713,
      }),
    ],
  });

  return hlsParser.stringify(master);
}

type ScheduleItem = {
  start: number;
  end: number;
  uri: string;
};

function createSchedule() {
  // Go back 30m in time
  const s = Date.now() - 1000 * 60 * 30;
  const schedule: ScheduleItem[] = [];

  // 30s clips each, 60 minutes in total
  for (let i = 0; i < 2 * 60; i++) {
    const start = s + i * 1000 * 30;
    schedule.push({
      start,
      end: start + 30 * 1000,
      uri: "468ea987-2c3a-4301-9eca-fb89fd26b79b",
    });
  }

  return schedule;
}

async function getMediaPlaylist(scheduleItem: ScheduleItem) {
  const masterFormat = formatUri(scheduleItem.uri);
  const masterUrl = withPath(masterFormat.base, masterFormat.file);
  const master = await fetchMemoizedPlaylist<MasterPlaylist>(masterUrl);

  const mediaUrl = withPath(masterFormat.base, master.variants[0].uri);
  const format = formatUri(mediaUrl);
  const media = await fetchMemoizedPlaylist<MediaPlaylist>(mediaUrl);

  return { format, media };
}

export async function getFastMediaPlaylist(path: string) {
  const now = Date.now();

  const dvrLength = 1000 * 60;

  const segments: Segment[] = [];

  let id = 1;
  let firstBase = 0;
  let targetDuration = 0;

  for (const scheduleItem of schedule) {
    const { format, media } = await getMediaPlaylist(scheduleItem);

    let prevDuration = 0;

    if (media.targetDuration > targetDuration) {
      targetDuration = media.targetDuration;
    }

    media.segments.forEach((segment, index) => {
      id++;

      const duration = Math.trunc(segment.duration * 1000);
      const start = scheduleItem.start + prevDuration;
      const end = start + duration;
      prevDuration += duration;

      if (start > now || end < now - dvrLength) {
        return;
      }

      if (!firstBase) {
        firstBase = id;
      }

      if (!index) {
        // If it's the last segment, it's a discontinuity.
        segment.discontinuity = true;
      }

      segment.programDateTime = new Date(start);

      if (segment.map?.uri === "init.mp4") {
        segment.map.uri = withPath(format.base, segment.map.uri);
      }

      segment.uri = withPath(format.base, segment.uri);

      segments.push(segment);
    });
  }

  // segments[0].programDateTime = new Date(pdt);

  const media = new MediaPlaylist({
    targetDuration,
    segments,
  });

  media.mediaSequenceBase = firstBase;

  return hlsParser.stringify(media);
}

const cache = new Map<string, string>();

async function fetchMemoizedPlaylist<T>(url: string) {
  let text = cache.get(url);

  if (!text) {
    const response = await fetch(url);
    text = await response.text();
    cache.set(url, text);
  }

  return hlsParser.parse(text) as T;
}
