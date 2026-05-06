import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete, ApiError } from "@/lib/api-client";
import { queryKeys } from "./query-keys";

export function useDashboardInterviews() {
  return useQuery({
    queryKey: ["dashboard", "interviews"],
    queryFn: async () => {
      const res = await apiGet<{ data: any }>("/api/dashboard/interviews");
      return res.data;
    },
  });
}

export function useDashboardInterview(interviewId: string) {
  return useQuery({
    queryKey: ["dashboard", "interviews", interviewId],
    queryFn: async () => {
      if (!interviewId) return null;
      const res = await apiGet<{ data: any }>(`/api/dashboard/interviews/${interviewId}`);
      return res.data;
    },
    enabled: !!interviewId,
  });
}

export function useDashboardInterviewMetadata() {
  return useQuery({
    queryKey: ["dashboard", "interviews", "metadata"],
    queryFn: async () => {
      const res = await apiGet<{ data: any }>("/api/dashboard/interviews/metadata");
      return res.data;
    },
  });
}

export function useCreateDashboardInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return apiPost<{ data: any; success: boolean }>("/api/dashboard/interviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "interviews"] });
    },
  });
}

export function useUpdateDashboardInterviewStatus(interviewId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { status: string }) => {
      return apiPatch<{ success: boolean; message?: string }>(`/api/dashboard/interviews/${interviewId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "interviews"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "interviews", interviewId] });
    },
  });
}

export function useCreateDashboardInterviewScore(interviewId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return apiPost<{ success: boolean; message?: string }>(`/api/dashboard/interviews/${interviewId}/score`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "interviews", interviewId] });
    },
  });
}
