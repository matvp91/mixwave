import * as z from "zod";
import { zodEnumLanguage } from "./lib/zod-helpers.js";

export const streamSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("video"),
    codec: z.enum(["h264", "vp9", "hevc"]),
    height: z.number(),
    bitrate: z.number(),
    framerate: z.number(),
  }),
  z.object({
    type: z.literal("audio"),
    codec: z.enum(["aac"]),
    bitrate: z.number(),
    language: zodEnumLanguage,
  }),
  z.object({
    type: z.literal("text"),
    language: zodEnumLanguage,
  }),
]);

export type Stream = z.infer<typeof streamSchema>;

export const inputSchema = z.discriminatedUnion("type", [
  z.object({
    path: z.string(),
    type: z.literal("video"),
  }),
  z.object({
    path: z.string(),
    type: z.literal("audio"),
    language: zodEnumLanguage,
  }),
  z.object({
    path: z.string(),
    type: z.literal("text"),
    language: zodEnumLanguage,
  }),
]);

export type Input = z.infer<typeof inputSchema>;
