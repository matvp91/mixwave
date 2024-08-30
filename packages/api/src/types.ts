export type JobDto = {
  id: string;
  name: string;
  state: "waiting" | "running" | "failed" | "completed";
  progress: number;
  createdOn: number;
  duration: number | null;
  inputData: string;
  outputData: string | null;
  failedReason: string | null;
  tag: string | null;
};

export type JobNodeDto = {
  job: JobDto;
  children: JobNodeDto[];
};
