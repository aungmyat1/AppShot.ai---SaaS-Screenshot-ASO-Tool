export type Store = "appstore" | "playstore";

export type JobStatus = "QUEUED" | "PROCESSING" | "COMPLETE" | "FAILED";

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  zipUrl?: string | null;
  error?: string | null;
  screenshotCount?: number;
}

