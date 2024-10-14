import { t } from "elysia";
import type { Static } from "elysia";

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

export const FolderDtoSchema = t.Union([
  t.Object({
    type: t.Literal("file"),
    path: t.String(),
    size: t.Number({ description: "Size in bytes" }),
    canPreview: t.Boolean(),
  }),
  t.Object({
    type: t.Literal("folder"),
    path: t.String(),
  }),
]);

export type FolderDto = Static<typeof FolderDtoSchema>;

export const FileDtoSchema = t.Object({
  path: t.String(),
  size: t.Number({ description: "Size in bytes" }),
  data: t.String(),
});

export type FileDto = Static<typeof FileDtoSchema>;
