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
          <CardDescription>Straightforward screenshot limits.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="font-medium">Free</div>
            <div className="mt-1 text-sm text-muted-foreground">$0</div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>10 screenshots / month</li>
              <li>Basic features</li>
            </ul>
          </div>
          <div className="rounded-lg border p-4">
            <div className="font-medium">Pro</div>
            <div className="mt-1 text-sm text-muted-foreground">$29 / month</div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>500 screenshots / month</li>
              <li>Priority support</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

