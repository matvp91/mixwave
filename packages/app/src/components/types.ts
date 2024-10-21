import { Job } from "@/api";

export type JobsFilterData = {
  tag?: string;
  name?: string;
  state?: Job["state"];
};
