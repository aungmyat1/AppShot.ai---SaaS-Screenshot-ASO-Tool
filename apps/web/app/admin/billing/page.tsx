import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminBillingClient } from "@/app/admin/billing/ui";

export const dynamic = "force-dynamic";

export default function AdminBillingPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>Invoices and refunds.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminBillingClient />
        </CardContent>
      </Card>
    </div>
  );
}

