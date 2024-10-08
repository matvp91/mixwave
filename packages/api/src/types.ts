import z from "zod";

const baseJobDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  state: z.enum(["waiting", "running", "failed", "completed"]),
  progress: z.number(),
  createdOn: z.number(),
  processedOn: z.number().nullable(),
  finishedOn: z.number().nullable(),
  duration: z.number().nullable(),
  inputData: z.string(),
  outputData: z.string().nullable(),
  failedReason: z.string().nullable(),
  tag: z.string().nullable(),
});

export type JobDto = z.infer<typeof baseJobDtoSchema> & {
  children: JobDto[];
};

export const jobDtoSchema: z.ZodType<JobDto> = baseJobDtoSchema.extend({
  children: z.lazy(() => jobDtoSchema.array()),
});

export const folderContentDtoSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("file"),
    path: z.string(),
    size: z.number(),
    canPreview: z.boolean(),
  }),
  z.object({
    type: z.literal("folder"),
    path: z.string(),
  }),
]);

export type FolderContentDto = z.infer<typeof folderContentDtoSchema>;

export const fileDtoSchema = z.object({
  path: z.string(),
  size: z.number(),
  data: z.string(),
});

export type FileDto = z.infer<typeof fileDtoSchema>;
