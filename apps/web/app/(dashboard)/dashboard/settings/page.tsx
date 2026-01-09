import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsClient } from "./settings-client";

export const metadata = { title: "Dashboard • Settings" };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Profile and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Account settings are managed by your auth provider.</CardContent>
      </Card>

      <SettingsClient />
    </div>
  );
}

