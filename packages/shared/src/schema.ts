import * as z from "zod";
import { zodEnumLanguage } from "./helpers.js";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";

extendZodWithOpenApi(z);

export const streamSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("video"),
    codec: z.enum(["h264", "vp9", "hevc"]),
    height: z.number(),
    bitrate: z.number().openapi({
      description: "Bitrate in bps.",
      example: 1500000,
    }),
    framerate: z.number().openapi({
      description: "Framerate in frames per second.",
      example: 24,
    }),
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
    path: z.string().openapi({
      description:
        "Specify either http(s)://path or s3://path when your input is located on your configured s3 bucket.",
    }),
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
