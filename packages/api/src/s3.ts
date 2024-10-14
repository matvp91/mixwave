import { S3, ListObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "./env";
import type { StorageFolder, StorageFile, StorageFolderItem } from "./types";

const client = new S3({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
});

export async function getStorageFolder(
  path: string,
  take = 10,
  cursor?: string,
): Promise<StorageFolder> {
  path = path.substring(1);

  const response = await client.send(
    new ListObjectsCommand({
      Bucket: env.S3_BUCKET,
      Delimiter: "/",
      Prefix: path,
      MaxKeys: take,
      Marker: cursor,
    }),
  );

  const items: StorageFolderItem[] = [];

  response.CommonPrefixes?.forEach((prefix) => {
    if (!prefix.Prefix) {
      return;
    }
    items.push({
      type: "folder",
      path: `/${prefix.Prefix}`,
    });
  });

  response.Contents?.forEach((content) => {
    if (!content.Key || content.Key === path) {
      return;
    }

    items.push({
      type: "file",
      path: `/${content.Key}`,
      size: content.Size ?? 0,
      canPreview: canFilePreview(content.Key),
    });
  });

  return {
    cursor: response.IsTruncated ? response.NextMarker : undefined,
    items,
  };
}

export async function getStorageFile(path: string): Promise<StorageFile> {
  path = path.substring(1);

  if (!canFilePreview(path)) {
    throw new Error("File cannot be previewed");
  }

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
    size: 0,
    data: await response.Body.transformToString("utf-8"),
  };
}

function canFilePreview(name: string): boolean {
  return (
    name.endsWith(".vtt") || name.endsWith(".m3u8") || name.endsWith(".json")
  );
}
