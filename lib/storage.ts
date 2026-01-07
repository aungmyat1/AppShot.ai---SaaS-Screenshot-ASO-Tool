import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

let client: S3Client | null = null;

export function getStorageClient() {
  if (client) return client;

  const region = process.env.STORAGE_REGION || "auto";
  const endpoint = process.env.STORAGE_ENDPOINT;
  const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY;

  client = new S3Client({
    region,
    ...(endpoint ? { endpoint } : {}),
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });

  return client;
}

export async function uploadBuffer(params: {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}) {
  const Bucket = requiredEnv("STORAGE_BUCKET");
  const s3 = getStorageClient();

  await s3.send(
    new PutObjectCommand({
      Bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: params.cacheControl,
    }),
  );

  const publicBase = process.env.STORAGE_PUBLIC_URL;
  const url = publicBase ? `${publicBase.replace(/\/$/, "")}/${params.key}` : null;

  return { key: params.key, url };
}

export async function getDownloadUrl(params: { key: string; expiresInSeconds?: number }) {
  const Bucket = requiredEnv("STORAGE_BUCKET");
  const publicBase = process.env.STORAGE_PUBLIC_URL;
  if (publicBase) return `${publicBase.replace(/\/$/, "")}/${params.key}`;

  const s3 = getStorageClient();
  const cmd = new GetObjectCommand({ Bucket, Key: params.key });
  return getSignedUrl(s3, cmd, { expiresIn: params.expiresInSeconds ?? 3600 });
}

