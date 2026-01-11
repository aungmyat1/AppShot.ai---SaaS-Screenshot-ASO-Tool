"use client";

import { useUiStore } from "@/lib/store/ui";
import { useJobStatus } from "@/lib/hooks/useJobStatus";
import { ScrapeForm } from "@/app/dashboard/scrape-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ScreenshotsPage() {
  const lastJobId = useUiStore((s) => s.lastJobId);
  const job = useJobStatus(lastJobId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Screenshots</CardTitle>
          <CardDescription>Scrape screenshots and download a ZIP.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ScrapeForm />
          {lastJobId ? (
            <div className="text-sm text-muted-foreground">
              Job: <span className="font-medium">{lastJobId}</span>{" "}
              {job.data?.status ? <span>• Status: {job.data.status}</span> : null}
              {job.data?.zipUrl ? (
                <>
                  {" "}
                  •{" "}
                  <a className="underline" href={job.data.zipUrl} target="_blank" rel="noreferrer">
                    Download ZIP
                  </a>
                </>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

