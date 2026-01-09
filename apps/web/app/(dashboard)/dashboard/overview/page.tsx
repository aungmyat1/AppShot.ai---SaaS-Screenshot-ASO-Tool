export const metadata = {
  title: "Dashboard • Overview",
};

import { AnalyticsClient } from "./analytics-client";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <AnalyticsClient />
    </div>
  );
}

