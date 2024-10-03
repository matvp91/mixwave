import { DateTime } from "luxon";
import { Block } from "./block.js";
import { assert } from "../assert.js";
import { getProfile } from "./profile.js";
import { pushRendition } from "../parser/index.js";
import type { Profile } from "./profile.js";
import type { MasterPlaylist, Rendition, Variant } from "../parser/index.js";
import type { Item } from "./types.js";

const DEFAULT_DVR_SIZE = 120;

export class Channel {
  private items_: Item[] = [];

  private profile_?: Profile;

  private startTime_ = DateTime.now();

  constructor() {}

  async schedule(uri: string) {
    const block = await Block.create(uri);

    if (!this.profile_) {
      this.profile_ = getProfile(block);
    }

    const item: Item = {
      uri,
      block,
      startTime: this.startTime_,
      duration: block.duration,
    };

    const lastItem = last(this.items_);
    if (lastItem) {
      item.startTime = lastItem.startTime.plus({ seconds: lastItem.duration });
    }

    this.items_.push(item);
  }

  getMasterPlaylist() {
    return this.buildMasterPlaylist_();
  }

  getMediaPlaylist(path: string) {
    return null;
  }

  private buildMasterPlaylist_() {
    assert(this.profile_);

    const master: MasterPlaylist = {
      isMasterPlaylist: true,
      independentSegments: true,
      variants: [],
    };

    this.profile_.variants.forEach((pv, index) => {
      if (pv.type === "video") {
        const variant: Variant = {
          uri: `${index}/video_${pv.bandwidth}/playlist.m3u8`,
          bandwidth: pv.bandwidth,
          resolution: pv.resolution,
        };
        master.variants.push(variant);
      }
    });

    this.profile_.variants.forEach((pv, index) => {
      if (pv.type === "audio") {
        const rendition: Rendition = {
          type: "AUDIO",
          groupId: "audio",
          name: pv.name,
          uri: `${index}/audio_${pv.name.toLowerCase()}/playlist.m3u8`,
        };

        master.variants.forEach((variant) => {
          pushRendition("audio", variant, rendition);
        });
      }
    });

    return master;
  }
}

function last<T extends unknown>(items: T[]) {
  return items[items.length - 1] ?? null;
}
