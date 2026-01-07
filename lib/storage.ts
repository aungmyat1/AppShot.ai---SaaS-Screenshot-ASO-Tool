import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function pickEnv(...names: string[]) {
  for (const n of names) {
    const v = process.env[n];
    if (v) return v;
  }
  return undefined;
}

function requiredOneOf(...names: string[]) {
  const v = pickEnv(...names);
  if (!v) throw new Error(`Missing env var (one of): ${names.join(", ")}`);
  return v;
}

let client: S3Client | null = null;

export function getStorageClient() {
  if (client) return client;

  const region = pickEnv("STORAGE_REGION") || "auto";
  const r2AccountId = pickEnv("R2_ACCOUNT_ID");
  const endpoint =
    pickEnv("STORAGE_ENDPOINT", "R2_ENDPOINT") || (r2AccountId ? `https://${r2AccountId}.r2.cloudflarestorage.com` : undefined);
  const accessKeyId = pickEnv("STORAGE_ACCESS_KEY_ID", "R2_ACCESS_KEY_ID", "AWS_ACCESS_KEY_ID");
  const secretAccessKey = pickEnv("STORAGE_SECRET_ACCESS_KEY", "R2_SECRET_ACCESS_KEY", "AWS_SECRET_ACCESS_KEY");

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
  const Bucket = requiredOneOf("STORAGE_BUCKET", "R2_BUCKET_NAME");
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

  const publicBase = pickEnv("STORAGE_PUBLIC_URL", "R2_PUBLIC_URL");
  const url = publicBase ? `${publicBase.replace(/\/$/, "")}/${params.key}` : null;

  return { key: params.key, url };
}

export async function getDownloadUrl(params: { key: string; expiresInSeconds?: number }) {
  const Bucket = requiredOneOf("STORAGE_BUCKET", "R2_BUCKET_NAME");
  const publicBase = pickEnv("STORAGE_PUBLIC_URL", "R2_PUBLIC_URL");
  if (publicBase) return `${publicBase.replace(/\/$/, "")}/${params.key}`;

  const s3 = getStorageClient();
  const cmd = new GetObjectCommand({ Bucket, Key: params.key });
  return getSignedUrl(s3, cmd, { expiresIn: params.expiresInSeconds ?? 3600 });
}

