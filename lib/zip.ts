import archiver from "archiver";
import axios from "axios";
import pLimit from "p-limit";
import { PassThrough } from "stream";

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
        const resp = await axios.get(e.url, { responseType: "arraybuffer", timeout: 30_000 });
        return { name: e.name, buf: Buffer.from(resp.data) };
      }),
    ),
  );

  for (const d of downloaded) {
    archive.append(d.buf, { name: d.name });
  }

  await archive.finalize();
  return done;
}

