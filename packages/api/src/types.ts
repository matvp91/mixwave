import { t } from "elysia";
import type { Static } from "elysia";

export const JobSchema = t.Recursive(
  (This) =>
    t.Object({
      id: t.String(),
      name: t.String(),
      state: t.Union([
        t.Literal("waiting"),
        t.Literal("running"),
        t.Literal("failed"),
        t.Literal("completed"),
      ]),
      progress: t.Number(),
      createdOn: t.Number(),
      processedOn: t.Optional(t.Number()),
      finishedOn: t.Optional(t.Number()),
      duration: t.Optional(t.Number()),
      inputData: t.String(),
      outputData: t.Optional(t.String()),
      failedReason: t.Optional(t.String()),
      tag: t.Optional(t.String()),
      children: t.Array(This),
    }),
  { $id: "#/components/schemas/Job" },
);

export type Job = Static<typeof JobSchema>;

export const StorageFolderItemSchema = t.Union(
  [
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
  ],
  { $id: "#/components/schemas/StorageFolderItem" },
);

export type StorageFolderItem = Static<typeof StorageFolderItemSchema>;

export const StorageFileSchema = t.Object(
  {
    path: t.String(),
    size: t.Number({ description: "Size in bytes" }),
    data: t.String(),
  },
  { $id: "#/components/schemas/StorageFile" },
);

export type StorageFile = Static<typeof StorageFileSchema>;

export const StorageFolderSchema = t.Object(
  {
    cursor: t.Optional(t.String()),
    items: t.Array(StorageFolderItemSchema),
  },
  { $id: "#/components/schemas/StorageFolder" },
);

export type StorageFolder = Static<typeof StorageFolderSchema>;
