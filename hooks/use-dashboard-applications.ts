import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiGet, apiPost, apiPatch } from "@/lib/api-client";
import { queryKeys } from "./query-keys";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

type StatusHistoryItem = {
  id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  changed_at: string;
  users: { fullName: string | null; email: string | null } | null;
};

type InterviewScore = {
  id: string;
  overall_score: number | null;
  technical_score: number | null;
  communication_score: number | null;
  cultural_fit_score: number | null;
  feedback: string | null;
  result: string;
  users: { fullName: string | null; email: string | null } | null;
};

type Interview = {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  type: string;
  status: string;
  meeting_link: string | null;
  location: string | null;
  notes: string | null;
  users: { fullName: string | null; email: string | null } | null;
  interview_scores: InterviewScore[];
};

type EmailLog = {
  id: string;
  subject: string;
  type: string;
  status: string;
  sent_at: string | null;
  error_message: string | null;
};

export type ApplicationDetail = {
  id: string;
  status: string;
  cv_file_url: string;
  cv_filename: string | null;
  cover_letter: string | null;
  applied_at: string;
  users: { fullName: string | null; email: string | null } | null;
  jobs: { title: string | null } | null;
  application_status_history: StatusHistoryItem[];
  interviews: Interview[];
  email_logs: EmailLog[];
};

export type ApplicationDetailInterviewer = {
  id: string;
  fullName: string | null;
  email: string;
};

export type ApplicationDetailData = {
  application: ApplicationDetail;
  interviewers: ApplicationDetailInterviewer[];
};

export type DashboardApplicationListItem = {
  id: string;
  status: string;
  source_channel: string | null;
  applied_at: string;
  users: { fullName: string | null; email: string | null } | null;
  jobs: { id: string; title: string | null } | null;
};

export type DashboardApplicationsPayload = {
  applications: DashboardApplicationListItem[];
  jobs: { id: string; title: string | null }[];
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useDashboardApplications(filters?: {
  jobId?: string;
  status?: string;
  source?: string;
}) {
  return useQuery({
    queryKey: ["dashboard", "applications", filters],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (filters?.jobId && filters.jobId !== "all") sp.append("jobId", filters.jobId);
      if (filters?.status && filters.status !== "all") sp.append("status", filters.status);
      if (filters?.source && filters.source !== "all") sp.append("source", filters.source);
      const url = `/api/dashboard/applications${sp.toString() ? `?${sp.toString()}` : ""}`;
      const res = await apiGet<{ data: DashboardApplicationsPayload }>(url);
      return res.data;
    },
  });
}

/** Chi tiết một đơn ứng tuyển, kèm danh sách interviewer. */
export function useDashboardApplicationDetail(appId: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.applications.detail(appId),
    queryFn: async () => {
      const res = await apiGet<{ data: ApplicationDetailData }>(
        `/api/dashboard/applications/${appId}`,
      );
      return res.data;
    },
    enabled: !!appId,
    retry: (_count, err) => !(err instanceof ApiError && err.status === 404),
  });
}

/** Cập nhật trạng thái + invalidate chi tiết. */
export function useUpdateDashboardApplicationStatus(appId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { status: string; notes?: string }) =>
      apiPatch<{ success: boolean; message?: string }>(
        `/api/dashboard/applications/${appId}/status`,
        data,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "applications"] });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.applications.detail(appId),
      });
    },
  });
}

export function useSendDashboardApplicationEmail(appId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiPost<{ success: boolean; message?: string }>(
        `/api/dashboard/applications/${appId}/email`,
        data,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.applications.detail(appId),
      });
    },
  });
}

export function useCreateDashboardApplicationInterview(appId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiPost<{ success: boolean; message?: string }>(
        `/api/dashboard/applications/${appId}/interviews`,
        data,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.applications.detail(appId),
      });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "interviews"] });
    },
  });
}

/** Shape đầy đủ của một email log (dùng cho trang /emails). */
export type ApplicationEmailLog = {
  id: string;
  application_id: string;
  recipient_id: string;
  sender_id: string | null;
  subject: string;
  type: "invite" | "result" | "reminder" | "rejection" | "offer";
  status: "pending" | "sent" | "failed";
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
  users_email_logs_recipient_idTousers: {
    id: string;
    fullName: string;
    email: string;
  } | null;
};

export type ApplicationEmailsData = {
  emailLogs: ApplicationEmailLog[];
  application: {
    users: { fullName: string } | null;
    jobs: { title: string } | null;
  } | null;
};

export function useDashboardApplicationEmails(appId: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.applications.emails(appId),
    queryFn: async () => {
      const res = await apiGet<{ data: ApplicationEmailsData }>(
        `/api/dashboard/applications/${appId}/emails`,
      );
      return res.data;
    },
    enabled: !!appId,
  });
}
