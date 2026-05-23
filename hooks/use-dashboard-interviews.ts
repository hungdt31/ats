import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { interview_scores_result, interviews_type, interviews_status } from "@prisma/client";
import { apiGet, apiPost, apiPatch } from "@/lib/api-client";
import { queryKeys } from "@/hooks/query-keys";

/** Một dòng trong bảng lịch phỏng vấn dashboard (`GET /api/dashboard/interviews`). */
export type DashboardInterviewListItem = {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  type: string;
  status: string;
  applications?: {
    users?: { fullName: string; email?: string };
    jobs?: { title: string };
  };
  users?: { fullName: string; email?: string };
};

/** Payload tạo lịch (`POST /api/dashboard/interviews`). */
export type CreateDashboardInterviewInput = {
  application_id: string;
  interviewer_id: string;
  scheduled_at: string;
  duration_minutes?: number;
  type?: interviews_type;
  meeting_link?: string | null;
  location?: string | null;
  notes?: string | null;
};

/** Bản ghi interview trả về sau khi tạo. */
export type DashboardInterviewRecord = {
  id: string;
  application_id: string;
  interviewer_id: string;
  scheduled_at: string;
  duration_minutes: number;
  type: string;
  status: string;
  meeting_link: string | null;
  location: string | null;
  notes: string | null;
};

/** Ứng viên/vị trí kèm theo trong metadata form. */
export type DashboardInterviewMetadataApplication = {
  id: string;
  users?: { fullName: string | null; email: string | null } | null;
  jobs?: { title: string | null } | null;
};

/** User có thể làm interviewer. */
export type DashboardInterviewMetadataInterviewer = {
  id: string;
  fullName: string | null;
  email: string;
  role: string;
};

/** Dữ liệu dropdown (`GET /api/dashboard/interviews/metadata`). */
export type DashboardInterviewMetadata = {
  applications: DashboardInterviewMetadataApplication[];
  interviewers: DashboardInterviewMetadataInterviewer[];
};

/** Nested application trong chi tiết phỏng vấn. */
export type DashboardInterviewDetailApplication = {
  id: string;
  job_id?: string;
  candidate_id?: string;
  status?: string;
  users?: { fullName: string | null; email: string | null } | null;
  jobs?: { title: string | null } | null;
};

export type DashboardInterviewDetailInterviewerUser = {
  id: string;
  fullName: string | null;
  email: string;
};

export type DashboardInterviewDetailEvaluator = {
  id: string;
  interview_id: string;
  user_id: string;
  role: string;
  created_at: string;
  users?: {
    id: string;
    fullName: string | null;
    email: string;
  };
};

export type DashboardInterviewDetailResult = {
  id: string;
  interview_id: string;
  reviewer_id: string;
  result: string;
  feedback: string | null;
  created_at: string;
  users?: {
    fullName: string | null;
  };
};

/** Một scorecard trong chi tiết. */
export type DashboardInterviewDetailScore = {
  id: string;
  interview_id: string;
  evaluator_id: string;
  technical_score: number | null;
  communication_score: number | null;
  cultural_fit_score: number | null;
  problem_solving_score: number | null;
  strengths: string | null;
  weaknesses: string | null;
  feedback: string | null;
  result: interview_scores_result;
  is_final: boolean;
  created_at?: string;
  users: { fullName: string | null; email: string | null };
};

/** Chi tiết phỏng vấn (`GET /api/dashboard/interviews/[id]`). */
export type DashboardInterviewDetail = {
  id: string;
  application_id: string;
  interviewer_id: string;
  scheduled_at: string;
  duration_minutes: number;
  type: string;
  status: string;
  meeting_link: string | null;
  location: string | null;
  notes: string | null;
  created_at?: string;
  applications?: DashboardInterviewDetailApplication | null;
  users?: DashboardInterviewDetailInterviewerUser | null;
  interview_scores?: DashboardInterviewDetailScore[];
  interview_evaluators?: DashboardInterviewDetailEvaluator[];
  interview_results?: DashboardInterviewDetailResult[];
};

/** Payload gửi điểm (`POST …/score`). */
export type CreateInterviewScorePayload = {
  technical_score?: number | null;
  communication_score?: number | null;
  cultural_fit_score?: number | null;
  problem_solving_score?: number | null;
  strengths?: string | null;
  weaknesses?: string | null;
  feedback?: string | null;
  /** Bắt buộc theo API — pass / fail / hold */
  result: interview_scores_result;
  is_final?: boolean;
};

type ApiEnvelope<T> = { success?: boolean; data: T };

/**
 * Danh sách phỏng vấn cho trang `/dashboard/interviews`.
 * `status`: `"all"` hoặc giá trị filter API (`scheduled`, `completed`, …).
 */
export function useDashboardInterviews(status = "all") {
  return useQuery({
    queryKey: queryKeys.dashboard.interviews.list(status),
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (status && status !== "all") sp.append("status", status);
      const qs = sp.toString();
      const url = qs ? `/api/dashboard/interviews?${qs}` : "/api/dashboard/interviews";
      const res = await apiGet<ApiEnvelope<DashboardInterviewListItem[]>>(url);
      return res.data;
    },
    staleTime: 5000,
  });
}

export function useDashboardInterview(interviewId: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.interviews.detail(interviewId),
    queryFn: async () => {
      if (!interviewId) return null;
      const res = await apiGet<ApiEnvelope<DashboardInterviewDetail>>(
        `/api/dashboard/interviews/${interviewId}`,
      );
      return res.data;
    },
    enabled: !!interviewId,
  });
}

export function useDashboardInterviewMetadata() {
  return useQuery({
    queryKey: queryKeys.dashboard.interviews.metadata(),
    queryFn: async () => {
      const res = await apiGet<ApiEnvelope<DashboardInterviewMetadata>>(
        "/api/dashboard/interviews/metadata",
      );
      return res.data;
    },
  });
}

export function useCreateDashboardInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDashboardInterviewInput) => {
      return apiPost<ApiEnvelope<DashboardInterviewRecord> & { success: boolean }>(
        "/api/dashboard/interviews",
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "interviews"] });
    },
  });
}

export function useUpdateDashboardInterviewStatus(interviewId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { status: interviews_status }) => {
      return apiPatch<{ success?: boolean }>(`/api/dashboard/interviews/${interviewId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "interviews"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.interviews.detail(interviewId) });
    },
  });
}

export function useCreateDashboardInterviewScore(interviewId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateInterviewScorePayload) => {
      return apiPost<{ success: boolean; message?: string }>(
        `/api/dashboard/interviews/${interviewId}/score`,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.interviews.detail(interviewId),
      });
    },
  });
}

export function useSubmitDashboardInterviewResult(interviewId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      result: string;
      feedback: string;
      next_status?: string;
    }) => {
      return apiPost<{ success: boolean; data?: any }>(
        `/api/dashboard/interviews/${interviewId}/result`,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "interviews"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.interviews.detail(interviewId) });
    },
  });
}
