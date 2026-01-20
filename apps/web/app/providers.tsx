"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 10_000,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(makeQueryClient);

  return (
    // @ts-ignore - next-themes type compatibility issue
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true} storageKey="app-theme">
      <QueryClientProvider client={client}>
        {children}
        {process.env.NODE_ENV === "development" ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </QueryClientProvider>
    </ThemeProvider>
  );
}

