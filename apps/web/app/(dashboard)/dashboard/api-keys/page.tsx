import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Dashboard • API keys" };

export default function ApiKeysPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API keys</CardTitle>
        <CardDescription>Coming soon (backed by the FastAPI service in `apps/api`).</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        This section will manage API keys, permissions, and per-key rate limits.
      </CardContent>
    </Card>
  );
}

