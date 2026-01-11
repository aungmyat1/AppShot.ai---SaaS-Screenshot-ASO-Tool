export const metadata = {
  title: "Dashboard • Overview",
};

import { AnalyticsClient } from "./analytics-client";

export default function OverviewPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const asUserId = typeof searchParams?.asUserId === "string" ? searchParams.asUserId : undefined;
  return (
    <div className="space-y-6">
      <AnalyticsClient asUserId={asUserId} />
    </div>
  );
}

