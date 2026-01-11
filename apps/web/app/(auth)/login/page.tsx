export const metadata = {
  title: "Login • GetAppShots",
};

import { LoginClient } from "./client";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight">Login</h1>
      <p className="text-sm text-muted-foreground">Sign in with email/password (JWT + refresh rotation).</p>
      {/* client component */}
      <LoginClient />
    </div>
  );
}

