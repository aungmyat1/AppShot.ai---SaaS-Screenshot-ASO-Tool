import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminContentClient } from "@/app/admin/content/ui";

export const dynamic = "force-dynamic";

export default function AdminContentPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>Pricing plans, feature flags, announcements, email templates.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminContentClient />
        </CardContent>
      </Card>
    </div>
  );
}

