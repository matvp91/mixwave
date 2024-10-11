import { streamSchema, inputSchema } from "./schemas";
import type { Static } from "@sinclair/typebox";

export type Stream = Static<typeof streamSchema>;

export type Input = Static<typeof inputSchema>;

export type FfmpegData = {
  params: {
    input: Input;
    stream: Stream;
    segmentSize: number;
    assetId: string;
  };
  metadata: {
    parentSortKey: number;
  };
};

export type FfmpegResult = {
  name: string;
  stream: Stream;
};

export type PackageData = {
  params: {
    assetId: string;
    segmentSize?: number;
    name: string;
  };
  metadata: {
    tag?: string;
  };
};

export type PackageResult = {
  assetId: string;
};

export type TranscodeData = {
  params: {
    assetId: string;
    segmentSize: number;
    packageAfter: boolean;
  };
  metadata: {
    tag?: string;
  };
};

export type TranscodeResult = {
  assetId: string;
};
