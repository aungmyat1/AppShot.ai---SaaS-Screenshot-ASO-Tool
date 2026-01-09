import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/dashboard/overview", label: "Overview" },
  { href: "/dashboard/screenshots", label: "Screenshots" },
  { href: "/dashboard/api-keys", label: "API keys" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <Card className="h-fit p-3">
        <nav className="flex flex-col gap-1">
          {nav.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {i.label}
            </Link>
          ))}
        </nav>
      </Card>
      <div>{children}</div>
    </div>
  );
}

