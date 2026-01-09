import { useQuery } from "@tanstack/react-query";

import { apiMe } from "@/lib/auth/client";

export function useAuth() {
  const me = useQuery({
    queryKey: ["auth", "me"],
    queryFn: apiMe,
    retry: false,
    staleTime: 5_000,
  });
  return { me };
}

