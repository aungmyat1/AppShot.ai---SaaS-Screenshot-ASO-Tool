"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUiStore } from "@/lib/store/ui";
import { withCsrfHeaders } from "@/lib/security/csrf";

export function ScrapeForm() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [zipUrl, setZipUrl] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const setLastJobId = useUiStore((s) => s.setLastJobId);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setZipUrl(null);
    setStatus(null);
    setLastJobId(null);
    setLoading(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: withCsrfHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as { zipUrl?: string; jobId?: string; status?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to scrape");
      if (data.zipUrl) {
        setZipUrl(data.zipUrl);
        setStatus("COMPLETE");
        return;
      }

      if (!data.jobId) throw new Error("No job id returned");
      setLastJobId(data.jobId);
      setStatus(data.status || "QUEUED");

      // Poll job status until complete/failed (queue mode)
      const startedAt = Date.now();
      const timeoutMs = 3 * 60_000;
      while (Date.now() - startedAt < timeoutMs) {
        await new Promise((r) => setTimeout(r, 2000));
        const jr = await fetch(`/api/jobs/${data.jobId}`, { cache: "no-store" });
        const jd = (await jr.json()) as { status?: string; zipUrl?: string; error?: string };
        if (!jr.ok) throw new Error(jd.error || "Failed to fetch job status");
        if (jd.status) setStatus(jd.status);
        if (jd.status === "FAILED") throw new Error(jd.error || "Job failed");
        if (jd.status === "COMPLETE") {
          if (!jd.zipUrl) throw new Error("Job complete but missing ZIP URL");
          setZipUrl(jd.zipUrl);
          return;
        }
      }
      throw new Error("Timed out waiting for ZIP. Please check history and try again.");
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
      {status ? <p className="text-sm text-muted-foreground">Status: {status}</p> : null}
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

