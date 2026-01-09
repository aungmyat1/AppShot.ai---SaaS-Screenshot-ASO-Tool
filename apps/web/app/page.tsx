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
          <CardDescription>Simple limits designed for solo builders.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="font-medium">FREE — “Try &amp; Trust”</div>
            <div className="mt-1 text-sm text-muted-foreground">$0</div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>1 app per day</li>
              <li>Max 5 screenshots</li>
              <li>Play Store OR App Store (not both per day)</li>
              <li>Cached results only</li>
            </ul>
          </div>
          <div className="rounded-lg border p-4">
            <div className="font-medium">STARTER — “Solo Builder”</div>
            <div className="mt-1 text-sm text-muted-foreground">$9 / month</div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>20 apps / month</li>
              <li>Up to 30 screenshots per app</li>
              <li>Play Store + App Store</li>
              <li>ZIP download</li>
              <li>Cache TTL: 24h</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

