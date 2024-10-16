import Hls from "hls.js";
import { EventManager } from "./event-manager";
import { assert } from "./assert";
import type { HlsAssetPlayer } from "hls.js";
import type { PlayheadState } from "./types";

export type HlsChunkEvents = {
  onBufferCreated(): void;
  onPlayheadStateChange(value: PlayheadState): void;
  onSeeked(): void;
  onVolumeChange(value: number): void;
};

export type HlsChunkParams = {
  hls?: Hls | null;
  media?: HTMLMediaElement | null;
  assetPlayer?: HlsAssetPlayer | null;
};

export class HlsChunk {
  private hlsEvents_: EventManager<Hls["on"], Hls["off"]>;

  private mediaEvents_: EventManager<
    HTMLMediaElement["addEventListener"],
    HTMLMediaElement["removeEventListener"]
  >;

  hls: Hls;

  media: HTMLMediaElement;

  assetPlayer?: HlsAssetPlayer;

  constructor(params: HlsChunkParams, events: HlsChunkEvents) {
    const { hls, media } = resolveChunkParams(params);

    this.hls = hls;
    this.media = media;

    this.assetPlayer = params.assetPlayer ?? undefined;

    this.hlsEvents_ = new EventManager({
      on: hls.on.bind(hls),
      off: hls.off.bind(hls),
    });

    this.hlsEvents_.on(Hls.Events.BUFFER_CREATED, () => {
      events.onBufferCreated();
    });

    this.mediaEvents_ = new EventManager({
      on: media.addEventListener.bind(media),
      off: media.removeEventListener.bind(media),
    });

    this.mediaEvents_.on("pause", () => {
      events.onPlayheadStateChange("pause");
    });

    this.mediaEvents_.on("play", () => {
      events.onPlayheadStateChange("play");
    });

    this.mediaEvents_.on("seeked", () => {
      events.onSeeked();
    });

    this.mediaEvents_.on("volumechange", () => {
      events.onVolumeChange(media.volume);
    });
  }

  dispose() {
    this.hlsEvents_.releaseAll();
    this.mediaEvents_.releaseAll();
  }

  get primary() {
    return this.assetPlayer === undefined;
  }
}

function resolveChunkParams(params: HlsChunkParams) {
  let hls = params.hls;
  let media = params.media;

  if (!media) {
    // If we did not pass a separate media element, we'll grab it from hls inst.
    media = hls?.media ?? undefined;
  }

  if (params.assetPlayer) {
    // If we provided an assetPlayer, we'll grab both hls and media from there.
    hls = params.assetPlayer.hls;
    // Fallback on media from HLS in case the element is re-used.
    media = params.assetPlayer.hls?.media ?? params.hls?.media ?? undefined;
  }

  assert(hls, "Failed to resolve hls");
  assert(media, "Failed to resolve media");

  return { hls, media };
}
