"use client";

import * as React from "react";
import { Apple, Loader2, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { withCsrfHeaders } from "@/lib/security/csrf";

type Store = "APP_STORE" | "PLAY_STORE";

function normalizeInput(store: Store, raw: string): string {
  const s = raw.trim();
  if (!s) return s;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  // Google Play package name
  if (store === "PLAY_STORE" && /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)+$/.test(s)) {
    return `https://play.google.com/store/apps/details?id=${encodeURIComponent(s)}`;
  }

  // Apple numeric app id
  if (store === "APP_STORE" && /^\d+$/.test(s)) {
    return `https://apps.apple.com/us/app/id${s}`;
  }

  return s;
}

export function LandingHero() {
  const [store, setStore] = React.useState<Store>("APP_STORE");
  const [input, setInput] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);
  const [zipUrl, setZipUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onFetch() {
    setError(null);
    setZipUrl(null);
    setStatus(null);
    setLoading(true);

    try {
      const url = normalizeInput(store, input);
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: withCsrfHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as { zipUrl?: string; jobId?: string; status?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to fetch screenshots");

      if (data.zipUrl) {
        setZipUrl(data.zipUrl);
        setStatus("COMPLETE");
        return;
      }

      if (!data.jobId) throw new Error("No job id returned");
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
      throw new Error("Timed out. Please try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl text-center">
      <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
        App Screenshots, <span className="text-primary">Instantly.</span>
      </h1>
      <p className="mt-4 text-pretty text-sm text-muted-foreground sm:text-base">
        Paste any App Store or Google Play link/ID to download all screenshots in seconds. Perfect for designers,
        marketers, and developers.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="inline-flex rounded-full border bg-background/40 p-1 backdrop-blur">
          <button
            type="button"
            onClick={() => setStore("APP_STORE")}
            className={[
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
              store === "APP_STORE" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            <Apple className="h-4 w-4" />
            App Store
          </button>
          <button
            type="button"
            onClick={() => setStore("PLAY_STORE")}
            className={[
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
              store === "PLAY_STORE" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            <Play className="h-4 w-4" />
            Google Play
          </button>
        </div>

        <div className="w-full max-w-2xl">
          <div className="flex flex-col gap-2 rounded-2xl border bg-background/40 p-2 backdrop-blur sm:flex-row">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., Instagram, 123456789, or com.google.android.gm"
              className="h-12 border-0 bg-transparent focus-visible:ring-0"
            />
            <Button className="h-12 rounded-xl" onClick={onFetch} disabled={loading || !input.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching…
                </>
              ) : (
                "Fetch"
              )}
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Sign up to get started with free usage.</div>

          {error ? <div className="mt-3 text-sm text-destructive">{error}</div> : null}
          {status ? <div className="mt-3 text-sm text-muted-foreground">Status: {status}</div> : null}
          {zipUrl ? (
            <div className="mt-3 text-sm">
              ZIP ready:{" "}
              <a className="underline" href={zipUrl} target="_blank" rel="noreferrer">
                download
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

