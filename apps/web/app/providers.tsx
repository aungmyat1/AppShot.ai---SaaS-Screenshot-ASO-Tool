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

  const ThemeProviderAny = ThemeProvider as any;

  return (
    <ThemeProviderAny 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem 
      storageKey="app-theme"
      disableTransitionOnChange
    >
      <QueryClientProvider client={client}>
        {children}
        {process.env.NODE_ENV === "development" ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </QueryClientProvider>
    </ThemeProviderAny>
  );
}

