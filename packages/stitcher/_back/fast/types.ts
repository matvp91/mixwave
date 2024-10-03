import type { DateTime } from "luxon";
import type { Block } from "./block";

export type Item = {
  uri: string;
  block: Block;
  startTime: DateTime;
  duration: number;
};
