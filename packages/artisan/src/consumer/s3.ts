import {
  GetObjectCommand,
  PutObjectCommand,
  S3,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { S3SyncClient } from "s3-sync-client";
import { env } from "./env.js";
import { basename } from "path";
import { writeFile } from "fs/promises";
import { existsSync } from "fs";
import { createReadStream } from "fs";
import type { Readable } from "stream";
import type { SyncOptions } from "s3-sync-client/dist/commands/SyncCommand";
import type { ObjectCannedACL } from "@aws-sdk/client-s3";

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
  commandInput?: (event: { Key: string }) => Partial<{}>;
};

export async function uploadFolder(
  path: string,
  key: string,
  options?: UploadFolderOptions,
) {
  await sync(path, `s3://${env.S3_BUCKET}/${key}`, options as SyncOptions);
}

export async function downloadFolder(path: string, key: string) {
  await sync(`s3://${env.S3_BUCKET}/${key}`, path);
}

export async function downloadFile(path: string, key: string) {
  if (existsSync(`${path}/${basename(key)}`)) {
    // We already have the file locally, there is nothing left to do.
    return;
  }

  const response = await client.send(
    new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    }),
  );

  await writeFile(`${path}/${basename(key)}`, response.Body as Readable);
}

export async function uploadFile(key: string, path: string) {
  await client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: createReadStream(path),
    }),
  );
}

export async function uploadJsonFile(key: string, content: string) {
  await client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: content,
      ContentType: "application/json",
    }),
  );
}

export async function copyFile(
  name: string,
  key: string,
  acl?: ObjectCannedACL,
) {
  await client.send(
    new CopyObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      CopySource: `/${env.S3_BUCKET}/${name}`,
      ACL: acl,
    }),
  );

  await client.send(
    new DeleteObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: name,
    }),
  );
}
