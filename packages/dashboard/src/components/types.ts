import { JobDto } from "@/tsr";

export type JobsFilterData = {
  tag?: string;
  name?: string;
  state?: JobDto["state"];
};
