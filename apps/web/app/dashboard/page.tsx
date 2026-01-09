import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ScrapeForm } from "@/app/dashboard/scrape-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BillingActions } from "@/app/dashboard/billing-actions";
import { getUsageSummary } from "@/lib/limits";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Legacy dashboard route: keep compatibility but send users to new dashboard overview.
  const { userId } = await auth();
  if (!userId) redirect("/login");

  redirect("/dashboard/overview");
}

