export type JobDto = {
  id: string;
  name: string;
  state: "waiting" | "running" | "failed" | "completed";
  progress: number;
  createdOn: number;
  processedOn: number | null;
  finishedOn: number | null;
  duration: number | null;
  inputData: string;
  outputData: string | null;
  failedReason: string | null;
  tag: string | null;
  children: JobDto[];
};
