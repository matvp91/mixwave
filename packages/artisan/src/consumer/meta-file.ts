import * as fs from "node:fs/promises";
import type { Stream } from "../types";

export type MetaFile = {
  version: number;
  streams: Record<string, Stream>;
  segmentSize: number;
};

/**
 * Will fetch meta file when meta.json is found in path.
 * @param path S3 dir
 * @returns
 */
export async function getMetaFile(path: string): Promise<MetaFile> {
  const text = await fs.readFile(`${path}/meta.json`, "utf8");
  return JSON.parse(text);
}
