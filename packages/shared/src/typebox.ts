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

export const LangCodeEnum = StringLiteralUnion(
  Object.keys(by639_2T) as (keyof typeof by639_2T)[],
);

LangCodeEnum.description = "ISO 639 (T2), 3 characters, language code.";

export type LangCode = Static<typeof LangCodeEnum>;

export const VideoCodecEnum = StringLiteralUnion(["h264", "vp9", "hevc"]);

export type VideoCodec = Static<typeof VideoCodecEnum>;

export const AudioCodecEnum = StringLiteralUnion(["aac"]);

export type AudioCodec = Static<typeof AudioCodecEnum>;
