"use client";

import { useEffect, useState } from "react";

export function FooterYear() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  // Return a placeholder during SSR to match server render
  if (year === null) {
    return <>{new Date().getFullYear()}</>;
  }

  return <>{year}</>;
}
