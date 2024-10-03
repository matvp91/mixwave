import { getChannelBlock } from "./channel-block.js";
import { DateTime } from "luxon";
import { getMediaPlaylist, mergeMediaPairs } from "./media.js";
import { assert } from "../assert.js";
import { stringify } from "../parser/index.js";
import type { ChannelBlock } from "./channel-block.js";
import type {
  MasterPlaylist,
  Rendition,
  Resolution,
  Variant,
} from "../parser/index.js";

export type Schedule = {
  items: {
    start: string;
    end: string;
    uri: string;
  }[];
};

export type TrackTemplate =
  | {
      type: "video";
      resolution: Resolution;
      bandwidth: number;
    }
  | {
      type: "audio";
      name: string;
    };

export class Channel {
  private blocks_: ChannelBlock[] = [];

  private trackTemplates_?: TrackTemplate[];

  private slidingLength_ = 120;

  constructor(private getSchedule_: () => Promise<Schedule>) {
    this.requestSchedule_();
  }

  private async requestSchedule_() {
    const schedule = await this.getSchedule_();

    const blocks = await Promise.all(
      schedule.items.map((item) =>
        getChannelBlock(item.start, item.end, item.uri),
      ),
    );

    const firstBlock = blocks[0];
    if (!this.trackTemplates_ && firstBlock) {
      this.createTrackTemplates_(firstBlock);
    }

    this.blocks_ = blocks;
  }

  private createTrackTemplates_(block: ChannelBlock) {
    const templates: TrackTemplate[] = [];

    block.master.variants.forEach((variant) => {
      if (!variant.resolution) {
        // We need the resolution and codecs later on for proper matching,
        // and merging media playlists.
        return;
      }

      templates.push({
        type: "video",
        resolution: variant.resolution,
        bandwidth: variant.bandwidth,
      });
    });

    block.master.variants[0]?.audio.forEach((audio) => {
      templates.push({
        type: "audio",
        name: audio.name,
      });
    });

    this.trackTemplates_ = templates;
  }

  getMasterPlaylist() {
    assert(this.trackTemplates_);

    const variants = this.trackTemplates_.reduce<Variant[]>(
      (acc, template, index) => {
        if (template.type !== "video") {
          return acc;
        }

        acc.push({
          uri: `${index}/video_${template.bandwidth}/playlist.m3u8`,
          bandwidth: template.bandwidth,
          resolution: template.resolution,
          audio: [],
          subtitles: [],
        });

        return acc;
      },
      [],
    );

    this.trackTemplates_.forEach((template, index) => {
      if (template.type !== "audio") {
        return;
      }
      const rendition: Rendition = {
        type: "AUDIO",
        groupId: "audio",
        name: template.name,
        uri: `${index}/audio_${template.name.toLowerCase()}/playlist.m3u8`,
      };

      variants.forEach((variant) => {
        variant.audio.push(rendition);
      });
    });

    const master: MasterPlaylist = {
      independentSegments: true,
      isMasterPlaylist: true,
      variants,
    };

    return stringify(master);
  }

  async getMediaPlaylist(path: string) {
    assert(this.trackTemplates_);

    const index = +path.split("/")[0];

    const now = DateTime.now();

    const template = this.trackTemplates_[index];

    const lowerBound = now.minus({ seconds: this.slidingLength_ });

    const blocks = this.blocks_.filter(
      (block) => block.end > lowerBound && block.start < now,
    );

    const mediaPairs = await Promise.all(
      blocks.map(async (block) => {
        return {
          block,
          media: await getMediaPlaylist(block, template),
        };
      }),
    );

    const media = mergeMediaPairs(now, this.slidingLength_, mediaPairs);

    return stringify(media);
  }
}
