export const metadata = {
  title: "Dashboard • Overview",
};

import { AnalyticsClient } from "./analytics-client";

export default async function OverviewPage({ 
  searchParams 
}: { 
  searchParams?: Promise<Record<string, string | string[] | undefined>> 
}) {
  const params = await searchParams;
  const asUserId = typeof params?.asUserId === "string" ? params.asUserId : undefined;
  return (
    <div className="space-y-6">
      <AnalyticsClient asUserId={asUserId} />
    </div>
  );
}

