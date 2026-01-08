import archiver from "archiver";
import axios from "axios";
import pLimit from "p-limit";
import http from "http";
import https from "https";
import { PassThrough } from "stream";

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 50 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50 });

const httpClient = axios.create({
  timeout: 30_000,
  // Reuse connections across many downloads (BIG perf win).
  httpAgent,
  httpsAgent,
  // Avoid silently accepting 404 HTML pages etc.
  validateStatus: (s) => s >= 200 && s < 300,
  headers: {
    "user-agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
  },
});

async function downloadImage(url: string): Promise<Buffer> {
  const resp = await httpClient.get<ArrayBuffer>(url, { responseType: "arraybuffer" });

  const contentType = String(resp.headers?.["content-type"] ?? "");
  // Some CDNs omit content-type; only fail if it's present and clearly not an image.
  if (contentType && !contentType.toLowerCase().includes("image")) {
    throw new Error(`Not an image response (content-type=${contentType})`);
  }

  const buf = Buffer.from(resp.data);
  if (buf.length < 1024) {
    throw new Error("Image too small (likely broken)");
  }
  return buf;
}

export async function createZipFromImageUrls(
  entries: { name: string; url: string }[],
  opts?: { maxBytes?: number },
): Promise<Buffer> {
  const output = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 9 } });

  const chunks: Buffer[] = [];
  let total = 0;

  output.on("data", (chunk: Buffer) => {
    chunks.push(chunk);
    total += chunk.length;
    if (opts?.maxBytes && total > opts.maxBytes) {
      archive.abort();
      output.destroy(new Error("ZIP too large"));
    }
  });

  const done = new Promise<Buffer>((resolve, reject) => {
    output.on("end", () => resolve(Buffer.concat(chunks)));
    output.on("error", reject);
    archive.on("warning", reject);
    archive.on("error", reject);
  });

  archive.pipe(output);

  const limit = pLimit(Number(process.env.DOWNLOAD_CONCURRENCY || 5));
  const downloaded = await Promise.all(
    entries.map((e) =>
      limit(async () => {
        const buf = await downloadImage(e.url);
        return { name: e.name, buf };
      }),
    ),
  );

  for (const d of downloaded) {
    archive.append(d.buf, { name: d.name });
  }

  await archive.finalize();
  return done;
}

