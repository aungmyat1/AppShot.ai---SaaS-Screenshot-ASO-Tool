export const metadata = {
  title: "Register • GetAppShots",
};

import { RegisterClient } from "./client";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight">Register</h1>
      <RegisterClient />
    </div>
  );
}

