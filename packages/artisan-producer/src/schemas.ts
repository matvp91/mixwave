import { Type as t } from "@sinclair/typebox";
import { by639_2T } from "iso-language-codes";

type By639_2T = typeof by639_2T;
type Lang = keyof By639_2T;

const LanguageEnum = t.Unsafe<Lang>({
  type: "string",
  enum: Object.keys(by639_2T),
});

export const streamSchema = t.Union([
  t.Object({
    type: t.Literal("video"),
    codec: t.Union([t.Literal("h264"), t.Literal("vp9"), t.Literal("hevc")]),
    height: t.Number(),
    bitrate: t.Number(),
    framerate: t.Number(),
  }),
  t.Object({
    type: t.Literal("audio"),
    codec: t.Union([t.Literal("aac")]),
    bitrate: t.Number(),
    language: LanguageEnum,
  }),
  t.Object({
    type: t.Literal("text"),
    language: LanguageEnum,
  }),
]);

export const inputSchema = t.Union([
  t.Object({
    type: t.Literal("video"),
    path: t.String(),
  }),
  t.Object({
    type: t.Literal("audio"),
    path: t.String(),
    language: LanguageEnum,
  }),
  t.Object({
    type: t.Literal("text"),
    path: t.String(),
    language: LanguageEnum,
  }),
]);
