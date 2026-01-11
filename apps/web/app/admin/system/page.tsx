import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SystemAdminClient } from "@/app/admin/system/ui";

export const dynamic = "force-dynamic";

export default function AdminSystemPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System</CardTitle>
          <CardDescription>Health, queues, and error logs.</CardDescription>
        </CardHeader>
        <CardContent>
          <SystemAdminClient />
        </CardContent>
      </Card>
    </div>
  );
}

