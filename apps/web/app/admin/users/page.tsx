import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersAdminClient } from "@/app/admin/users/ui";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Search, filter, suspend, and manage plans.</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersAdminClient />
        </CardContent>
      </Card>
    </div>
  );
}

