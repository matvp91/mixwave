export type JobDto = {
  id: string;
  name: string;
  state: "waiting" | "running" | "failed" | "completed";
  progress: number;
  createdOn: number;
  processedOn?: number;
  finishedOn?: number;
  duration?: number;
  inputData: string;
  outputData?: string;
  failedReason?: string;
  tag?: string;
  children: JobDto[];
};

export type FolderContentDto =
  | {
      type: "file";
      path: string;
      size: number;
      canPreview: boolean;
    }
  | {
      type: "folder";
      path: string;
    };

export type FileDto = {
  path: string;
  size: number;
  data: string;
};
