import type { JobState } from "bullmq";

export type JobDto = {
  id: string;
  name: string;
  state: JobState | "unknown";
  progress: number;
  finishedOn: number | null;
  processedOn: number | null;
  createdOn: number;
  inputData: string;
  outputData: string | null;
};

export type JobNodeDto = {
  job: JobDto;
  children: JobNodeDto[];
};
