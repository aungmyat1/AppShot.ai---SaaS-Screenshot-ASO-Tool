"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ScrapeForm() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [zipUrl, setZipUrl] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setZipUrl(null);
    setLoading(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as { zipUrl?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to scrape");
      if (!data.zipUrl) throw new Error("No ZIP URL returned");
      setZipUrl(data.zipUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="https://apps.apple.com/... or https://play.google.com/store/apps/details?id=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button type="submit" disabled={loading || !url.trim()}>
          {loading ? "Scraping…" : "Scrape"}
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {zipUrl ? (
        <p className="text-sm">
          ZIP ready:{" "}
          <a className="underline" href={zipUrl} target="_blank" rel="noreferrer">
            download
          </a>
        </p>
      ) : null}
    </form>
  );
}

