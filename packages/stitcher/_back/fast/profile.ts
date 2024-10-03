import type { Resolution } from "../parser/index.js";
import type { Block } from "./block.js";

export type ProfileVariant =
  | {
      type: "video";
      bandwidth: number;
      resolution: Resolution;
    }
  | {
      type: "audio";
      name: string;
    };

export type Profile = {
  variants: ProfileVariant[];
};

export function getProfile(block: Block) {
  const { master } = block;
  const profile: Profile = {
    variants: [],
  };

  master.variants.forEach((variant) => {
    if (!variant.resolution) {
      return;
    }
    profile.variants.push({
      type: "video",
      resolution: variant.resolution,
      bandwidth: variant.bandwidth,
    });
  });

  master.variants[0].audio?.forEach((audio) => {
    profile.variants.push({
      type: "audio",
      name: audio.name,
    });
  });

  return profile;
}
