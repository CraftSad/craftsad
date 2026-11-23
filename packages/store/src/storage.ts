import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function s3Client() {
  return new S3Client({
    endpoint: process.env.STORE_S3_ENDPOINT,
    region: process.env.STORE_S3_REGION ?? "us-east-1",
    forcePathStyle: process.env.STORE_S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: process.env.STORE_S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.STORE_S3_SECRET_ACCESS_KEY ?? "",
    },
  });
}

export async function storeArchive(
  name: string,
  body: Uint8Array,
): Promise<string> {
  const bucket = process.env.STORE_S3_BUCKET;
  if (bucket) {
    await s3Client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: `orders/${name}`,
        Body: body,
        ContentType: "application/zip",
      }),
    );
    return `s3://${bucket}/orders/${name}`;
  }
  const root = resolve(process.env.STORE_ARCHIVE_DIR ?? "./var/archives");
  await mkdir(root, { recursive: true });
  await writeFile(resolve(root, name), body);
  return `file://${resolve(root, name)}`;
}

export async function readArchive(url: string): Promise<Uint8Array> {
  if (url.startsWith("s3://")) {
    const match = /^s3:\/\/([^/]+)\/(.+)$/.exec(url);
    if (!match) throw new Error("Неверный адрес архива");
    const response = await s3Client().send(
      new GetObjectCommand({ Bucket: match[1], Key: match[2] }),
    );
    if (!response.Body) throw new Error("Архив пуст");
    return response.Body.transformToByteArray();
  }
  if (!url.startsWith("file://")) throw new Error("Неверный адрес архива");
  const root = resolve(process.env.STORE_ARCHIVE_DIR ?? "./var/archives");
  const path = resolve(url.slice(7));
  if (!path.startsWith(`${root}\\`) && !path.startsWith(`${root}/`))
    throw new Error("Архив вне каталога");
  return new Uint8Array(await readFile(path));
}
