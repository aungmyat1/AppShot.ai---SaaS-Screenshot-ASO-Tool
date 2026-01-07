import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ScrapeForm } from "@/app/dashboard/scrape-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BillingActions } from "@/app/dashboard/billing-actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getOrCreateUser(userId);
  const jobs = await prisma.scrapeJob.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Paste an App Store URL, then download the ZIP.</p>
        </div>
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          Admin
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scrape screenshots</CardTitle>
          <CardDescription>
            Credits: <span className="font-medium">{user.creditsBalance}</span> • Plan:{" "}
            <span className="font-medium">{user.plan}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            <ScrapeForm />
            <BillingActions />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Your most recent scrape jobs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Screenshots</TableHead>
                <TableHead>Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No scrapes yet.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell>{j.createdAt.toISOString().slice(0, 19).replace("T", " ")}</TableCell>
                    <TableCell>{j.store}</TableCell>
                    <TableCell>{j.status}</TableCell>
                    <TableCell>{j.screenshotCount}</TableCell>
                    <TableCell>
                      {j.zipUrl ? (
                        <a className="underline" href={j.zipUrl} target="_blank" rel="noreferrer">
                          ZIP
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

