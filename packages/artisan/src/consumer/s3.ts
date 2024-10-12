import { GetObjectCommand, S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { S3SyncClient } from "s3-sync-client";
import { basename } from "path";
import { writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { env } from "./env";
import type { Readable } from "node:stream";
import type { SyncOptions } from "s3-sync-client/dist/commands/SyncCommand";

const client = new S3({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
});

const { sync } = new S3SyncClient({ client });

type UploadFolderOptions = {
  del?: boolean;
  commandInput?: (event: { Key: string }) => Partial<object>;
};

/**
 * Upload a folder, with all files and subdirectories to S3.
 * @param path Local file path
 * @param key S3 key
 * @param options
 */
export async function uploadFolder(
  path: string,
  key: string,
  options?: UploadFolderOptions,
) {
  await sync(path, `s3://${env.S3_BUCKET}/${key}`, options as SyncOptions);
}

/**
 * Download a folder, with all subdirectories from S3.
 * @param key S3 key
 * @param path Local file path
 */
export async function downloadFolder(key: string, path: string) {
  await sync(`s3://${env.S3_BUCKET}/${key}`, path);
}

/**
 * Download a single file from S3 to local file system.
 * @param path Local file path
 * @param key S3 key
 */
export async function downloadFile(path: string, key: string) {
  const response = await client.send(
    new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    }),
  );

  await writeFile(`${path}/${basename(key)}`, response.Body as Readable);
}

/**
 * Upload a single file to S3 from local file system.
 * @param key S3 key
 * @param path Local file path
 */
export async function uploadFile(key: string, path: string) {
  const upload = new Upload({
    client,
    params: {
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: createReadStream(path),
    },
  });
  await upload.done();
}

/**
 * Upload an object as a *.json file.
 * @param key S3 key
 * @param data Any object, will be serialized to json.
 */
export async function uploadJson(key: string, data: object) {
  if (!key.endsWith(".json")) {
    throw new Error("Key must be a .json file");
  }
  const upload = new Upload({
    client,
    params: {
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json",
    },
  });
  await upload.done();
}
