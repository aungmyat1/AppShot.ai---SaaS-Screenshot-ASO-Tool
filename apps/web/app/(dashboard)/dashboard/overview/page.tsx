import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Dashboard • Overview",
};

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Quick links and recent activity.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Go to <Link className="underline" href="/dashboard/screenshots">Screenshots</Link> to start a scrape.
        </CardContent>
      </Card>
    </div>
  );
}

