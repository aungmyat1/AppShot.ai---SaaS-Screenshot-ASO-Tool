export function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export function unescapePlayUrl(s: string) {
  return s
    .replace(/\\u003d/g, "=")
    .replace(/\\u0026/g, "&")
    .replace(/&amp;/g, "&");
}

function extractJsonLdBlocks(html: string): string[] {
  const blocks: string[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m[1]) blocks.push(m[1]);
  }
  return blocks;
}

function coerceToUrls(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(coerceToUrls);
  // Some JSON-LD shapes use objects (e.g. { "@type": "ImageObject", "url": "..." })
  if (typeof value === "object") {
    const v = value as Record<string, unknown>;
    if (typeof v.url === "string") return [v.url];
    if (typeof v.contentUrl === "string") return [v.contentUrl];
  }
  return [];
}

export function extractLdJsonScreenshotUrls(html: string): string[] {
  const blocks = extractJsonLdBlocks(html);
  const urls: string[] = [];

  for (const raw of blocks) {
    try {
      const parsed = JSON.parse(raw.trim()) as unknown;
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const obj of candidates) {
        if (!obj || typeof obj !== "object") continue;
        const rec = obj as Record<string, unknown>;
        // Per schema.org, `screenshot` can be a URL, ImageObject, or array.
        urls.push(...coerceToUrls(rec.screenshot));
      }
    } catch {
      // ignore malformed JSON-LD
    }
  }

  return uniq(
    urls
      .map(unescapePlayUrl)
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http")),
  );
}

