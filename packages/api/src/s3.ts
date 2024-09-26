import { S3, ListObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "./env.js";
import type { FolderDto, PreviewDto } from "./types.js";

const client = new S3({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
});

export async function getStorage(
  path: string,
  take: number = 10,
  skip?: string,
): Promise<FolderDto> {
  const response = await client.send(
    new ListObjectsCommand({
      Bucket: env.S3_BUCKET,
      Delimiter: "/",
      Prefix: path,
      MaxKeys: take,
      Marker: skip,
    }),
  );

  const folder: FolderDto = {
    path,
    contents: [],
    skip: response.IsTruncated ? response.NextMarker : undefined,
  };

  response.CommonPrefixes?.forEach((prefix) => {
    if (!prefix.Prefix) {
      return;
    }
    folder.contents.push({
      type: "folder",
      path: prefix.Prefix,
    });
  });

  response.Contents?.forEach((content) => {
    if (!content.Key) {
      return;
    }
    folder.contents.push({
      type: "file",
      path: content.Key,
      size: content.Size ?? 0,
    });
  });

  return folder;
}

export async function getStoragePreview(path: string): Promise<PreviewDto> {
  const response = await client.send(
    new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: path,
    }),
  );

  if (!response.Body) {
    throw new Error("Missing body");
  }

  return {
    path,
    data: await response.Body.transformToString("utf-8"),
  };
}
