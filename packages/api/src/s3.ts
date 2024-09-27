import { S3, ListObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "./env.js";
import type { FolderContentDto, FileDto } from "./types.js";

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
  cursor?: string,
): Promise<{
  cursor?: string;
  contents: FolderContentDto[];
}> {
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

  const contents: FolderContentDto[] = [];

  response.CommonPrefixes?.forEach((prefix) => {
    if (!prefix.Prefix) {
      return;
    }
    contents.push({
      type: "folder",
      path: `/${prefix.Prefix}`,
    });
  });

  response.Contents?.forEach((content) => {
    if (!content.Key || content.Key === path) {
      return;
    }

    contents.push({
      type: "file",
      path: `/${content.Key}`,
      size: content.Size ?? 0,
      canPreview: canFilePreview(content.Key),
    });
  });

  return {
    cursor: response.IsTruncated ? response.NextMarker : undefined,
    contents,
  };
}

export async function getStorageFile(path: string): Promise<FileDto> {
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

function canFilePreview(name: string) {
  return (
    name.endsWith(".vtt") || name.endsWith(".m3u8") || name.endsWith(".json")
  );
}
