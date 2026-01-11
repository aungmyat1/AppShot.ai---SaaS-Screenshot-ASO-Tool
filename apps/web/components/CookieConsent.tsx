"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const KEY = "cookie_consent";

export function CookieConsent() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (!v) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  const accept = (value: "accepted" | "rejected") => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      // ignore
    }
    setOpen(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-3 z-50 mx-auto max-w-2xl px-3">
      <Card className="flex flex-col gap-3 p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          We use cookies for authentication and basic analytics. See{" "}
          <a className="underline" href="/privacy">
            Privacy Policy
          </a>
          .
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => accept("rejected")}>
            Reject
          </Button>
          <Button onClick={() => accept("accepted")}>Accept</Button>
        </div>
      </Card>
    </div>
  );
}

