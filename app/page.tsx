import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">Scrape app store screenshots. Download as a ZIP.</h1>
        <p className="text-muted-foreground">
          GetAppShots pulls screenshots from the iOS App Store and Google Play, then packages them into a downloadable ZIP.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/#pricing">View plans</Link>
        </Button>
      </div>

      <Card id="pricing">
        <CardHeader>
          <CardTitle>Plans</CardTitle>
          <CardDescription>Stripe subscriptions + credits/usage enforced server-side.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="font-medium">Free</div>
            <div className="text-sm text-muted-foreground">Limited monthly credits</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="font-medium">Starter</div>
            <div className="text-sm text-muted-foreground">More credits + faster processing</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="font-medium">Pro</div>
            <div className="text-sm text-muted-foreground">Highest credits + team-ready</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

