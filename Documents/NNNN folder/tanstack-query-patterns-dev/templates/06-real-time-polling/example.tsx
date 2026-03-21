import { useQuery } from "@tanstack/react-query";

export interface JobStatus {
  id: string;
  status: "queued" | "running" | "done" | "failed";
  progress?: number;
  result?: string;
  error?: string;
}

export async function fetchJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`/api/jobs/${jobId}`);
  if (!res.ok) throw new Error("Failed to fetch job status");
  return res.json();
}

// Poll until job completes, then stop
export function useJobStatus(jobId: string) {
  return useQuery({
    queryKey: ["jobs", jobId],
    queryFn: () => fetchJobStatus(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Stop polling when job finishes
      if (status === "done" || status === "failed") return false;
      return 2000; // poll every 2s while running
    },
    refetchIntervalInBackground: false, // pause when tab is not focused
    staleTime: 0, // always treat as stale for polling
  });
}

export function JobStatusDisplay({ jobId }: { jobId: string }) {
  const { data, isLoading } = useJobStatus(jobId);

  if (isLoading) return <div>Starting job...</div>;

  return (
    <div>
      <p>Status: <strong>{data?.status}</strong></p>
      {data?.progress !== undefined && (
        <progress value={data.progress} max={100} style={{ width: "100%" }} />
      )}
      {data?.status === "done" && <p style={{ color: "green" }}>✓ {data.result}</p>}
      {data?.status === "failed" && <p style={{ color: "red" }}>✗ {data.error}</p>}
    </div>
  );
}

// General-purpose polling hook with custom interval
export function usePolling<T>(
  queryKey: unknown[],
  queryFn: () => Promise<T>,
  intervalMs = 5000,
  enabled = true
) {
  return useQuery({
    queryKey,
    queryFn,
    refetchInterval: enabled ? intervalMs : false,
    refetchIntervalInBackground: false,
    staleTime: 0,
  });
}
