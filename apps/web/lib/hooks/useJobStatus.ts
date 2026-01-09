import { useQuery } from "@tanstack/react-query";

type JobStatus = {
  jobId: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETE" | "FAILED";
  zipUrl?: string | null;
  error?: string | null;
  screenshotCount?: number;
};

export function useJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ["job", jobId],
    enabled: !!jobId,
    queryFn: async (): Promise<JobStatus> => {
      const res = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
      const data = (await res.json()) as JobStatus & { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load job");
      return data;
    },
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      if (!s) return 2000;
      return s === "COMPLETE" || s === "FAILED" ? false : 2000;
    },
  });
}

