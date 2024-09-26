import { S3, ListObjectsCommand } from "@aws-sdk/client-s3";
import { env } from "./env.js";
import { basename } from "path";
import type { FolderDto } from "./types.js";

const client = new S3({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
});

export async function getStorage(path: string): Promise<FolderDto> {
  const response = await client.send(
    new ListObjectsCommand({
      Bucket: env.S3_BUCKET,
      Delimiter: "/",
      Prefix: path,
    }),
  );

  const folder: FolderDto = {
    path,
    files: [],
    subFolders: [],
  };

  if (response.CommonPrefixes) {
    for (const commonPrefix of response.CommonPrefixes) {
      if (!commonPrefix.Prefix) {
        continue;
      }

      let name = commonPrefix.Prefix.substring(path.length);
      if (name.endsWith("/")) {
        name = name.substring(0, name.length - 1);
      }

      folder.subFolders.push({
        name,
        path: commonPrefix.Prefix,
      });
    }
  }

  if (response.Contents) {
    for (const content of response.Contents) {
      if (!content.Key) {
        continue;
      }
      folder.files.push({
        name: basename(content.Key),
        path: content.Key,
        size: content.Size ?? 0,
      });
    }
  }

  return folder;
}
