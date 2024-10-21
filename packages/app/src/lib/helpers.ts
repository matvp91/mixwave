import prettyMs from "pretty-ms";
import prettyBytes from "pretty-bytes";
import * as timeAgo from "timeago.js";

export function getDurationStr(duration?: number | null) {
  if (!duration) {
    return null;
  }
  return prettyMs(Math.trunc(duration / 1000) * 1000, {});
}

export function getShortId(id: string) {
  const chunks = id.split("_", 3);
  return chunks[chunks.length - 1].substring(0, 7);
}

export function getTimeAgo(value: number | null) {
  if (!value) {
    return null;
  }
  return timeAgo.format(value);
}

export function getSizeStr(size: number | null) {
  if (!size) {
    return null;
  }
  return prettyBytes(size);
}
