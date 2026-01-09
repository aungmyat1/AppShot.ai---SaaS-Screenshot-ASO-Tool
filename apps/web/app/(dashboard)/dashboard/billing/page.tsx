import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingActions } from "@/app/dashboard/billing-actions";

export const metadata = { title: "Dashboard • Billing" };

export default function BillingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>Manage your subscription.</CardDescription>
      </CardHeader>
      <CardContent>
        <BillingActions />
      </CardContent>
    </Card>
  );
}

