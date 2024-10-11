import type { LangCode, VideoCodec, AudioCodec } from "@mixwave/shared";

export type Stream =
  | {
      type: "video";
      codec: VideoCodec;
      height: number;
      bitrate: number;
      framerate: number;
    }
  | {
      type: "audio";
      codec: AudioCodec;
      bitrate: number;
      language: LangCode;
    }
  | {
      type: "text";
      language: LangCode;
    };

export type Input =
  | {
      type: "video";
      path: string;
    }
  | {
      type: "audio";
      path: string;
      language: LangCode;
    }
  | {
      type: "text";
      path: string;
      language: LangCode;
    };

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
