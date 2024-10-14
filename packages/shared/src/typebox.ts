import { Type as t } from "@sinclair/typebox";
import { by639_2T } from "iso-language-codes";
import type { TLiteral, TUnion, Static } from "@sinclair/typebox";

type IntoStringLiteralUnion<T> = {
  [K in keyof T]: T[K] extends string ? TLiteral<T[K]> : never;
};

function StringLiteralUnion<T extends string[]>(
  values: [...T],
): TUnion<IntoStringLiteralUnion<T>> {
  const literals = values.map((value) => t.Literal(value));
  return t.Union(literals) as TUnion<IntoStringLiteralUnion<T>>;
}

export const LangCodeSchema = StringLiteralUnion(
  Object.keys(by639_2T) as (keyof typeof by639_2T)[],
);
LangCodeSchema.description = "ISO 639 (T2), 3 characters, language code.";
LangCodeSchema.$id = "#/components/schemas/LangCode";

export type LangCode = Static<typeof LangCodeSchema>;

export const VideoCodecSchema = StringLiteralUnion(["h264", "vp9", "hevc"]);
VideoCodecSchema.description = "Supported video codecs.";
VideoCodecSchema.$id = "#/components/schemas/VideoCodec";

export type VideoCodec = Static<typeof VideoCodecSchema>;

export const AudioCodecSchema = StringLiteralUnion(["aac"]);
AudioCodecSchema.description = "Supported audio codecs.";
AudioCodecSchema.$id = "#/components/schemas/AudioCodec";

export type AudioCodec = Static<typeof AudioCodecSchema>;
