import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiPut, apiDelete, ApiError } from "@/lib/api-client";
import { queryKeys } from "./query-keys";

export function useDashboardJobs() {
  return useQuery({
    queryKey: ["dashboard", "jobs"],
    queryFn: async () => {
      const res = await apiGet<{ data: any }>("/api/dashboard/jobs");
      return res.data;
    },
  });
}

export function useDashboardJob(jobId: string) {
  return useQuery({
    queryKey: ["dashboard", "jobs", jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const res = await apiGet<{ data: any }>(`/api/dashboard/jobs/${jobId}`);
      return res.data;
    },
    enabled: !!jobId,
  });
}

export function useCreateDashboardJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return apiPost<{ data: any; success: boolean }>("/api/dashboard/jobs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "jobs"] });
    },
  });
}

export function useUpdateDashboardJob(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return apiPut<{ data: any; success: boolean }>(`/api/dashboard/jobs/${jobId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "jobs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "jobs", jobId] });
    },
  });
}

export function useDeleteDashboardJob(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return apiDelete<{ success: boolean }>(`/api/dashboard/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "jobs"] });
    },
  });
}

export function useDashboardJobChannels(jobId: string) {
  return useQuery({
    queryKey: ["dashboard", "jobs", jobId, "channels"],
    queryFn: async () => {
      const res = await apiGet<{ data: any }>(`/api/dashboard/jobs/${jobId}/channels`);
      return res.data;
    },
    enabled: !!jobId,
  });
}

export function useUpdateDashboardJobChannels(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return apiPost<{ success: boolean }>(`/api/dashboard/jobs/${jobId}/channels`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "jobs", jobId, "channels"] });
    },
  });
}

export function useApproveDashboardJob(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return apiPost<{ success: boolean }>(`/api/dashboard/jobs/${jobId}/approve`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "jobs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "jobs", jobId] });
    },
  });
}

