import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete, ApiError } from "@/lib/api-client";
import { queryKeys } from "./query-keys";

export function useDashboardApplications(filters?: { jobId?: string; status?: string; source?: string }) {
  return useQuery({
    queryKey: ["dashboard", "applications", filters],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (filters?.jobId && filters.jobId !== "all") sp.append("jobId", filters.jobId);
      if (filters?.status && filters.status !== "all") sp.append("status", filters.status);
      if (filters?.source && filters.source !== "all") sp.append("source", filters.source);

      const url = `/api/dashboard/applications${sp.toString() ? `?${sp.toString()}` : ""}`;
      const res = await apiGet<{ data: any }>(url);
      return res.data;
    },
  });
}

export function useDashboardApplication(appId: string) {
  return useQuery({
    queryKey: ["dashboard", "applications", appId],
    queryFn: async () => {
      if (!appId) return null;
      const res = await apiGet<{ data: any }>(`/api/dashboard/applications/${appId}`);
      return res.data;
    },
    enabled: !!appId,
  });
}

export function useUpdateDashboardApplicationStatus(appId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { status: string; notes?: string }) => {
      return apiPatch<{ success: boolean; message?: string }>(`/api/dashboard/applications/${appId}/status`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "applications", appId] });
    },
  });
}

export function useSendDashboardApplicationEmail(appId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return apiPost<{ success: boolean; message?: string }>(`/api/dashboard/applications/${appId}/email`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "applications", appId, "emails"] });
    },
  });
}

export function useCreateDashboardApplicationInterview(appId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return apiPost<{ success: boolean; message?: string }>(`/api/dashboard/applications/${appId}/interviews`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "applications", appId, "interviews"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "interviews"] });
    },
  });
}

export function useDashboardApplicationEmails(appId: string) {
  return useQuery({
    queryKey: ["dashboard", "applications", appId, "emails"],
    queryFn: async () => {
      if (!appId) return null;
      const res = await apiGet<{ data: any }>(`/api/dashboard/applications/${appId}/emails`);
      return res.data;
    },
    enabled: !!appId,
  });
}
