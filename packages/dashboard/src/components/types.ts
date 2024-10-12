import { JobDto } from "@/api";

export type JobsFilterData = {
  tag?: string;
  name?: string;
  state?: JobDto["state"];
};
