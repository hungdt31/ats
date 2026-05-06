import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import { apiGet, apiPost } from "@/lib/api-client";

export type ApplicationResponseItem = {
  id: string;
  job_id: string;
  candidate_id: string;
  cv_file_url: string;
  cv_filename: string | null;
  cover_letter: string | null;
  status: string;
  applied_at: string;
  jobs: {
    id: string;
    title: string;
    location: string | null;
    department: string | null;
    employment_type: string;
  };
};

export type CandidateProfileData = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  profile: {
    title: string | null;
    bio: string | null;
    location: string | null;
    years_experience: number;
    linkedin_url: string | null;
    github_url: string | null;
  } | null;
};

/** Lấy danh sách các đơn ứng tuyển của ứng viên */
export function useCandidateApplications() {
  return useQuery({
    queryKey: queryKeys.candidate.applications(),
    queryFn: async () => {
      const res = await apiGet<{ success: boolean; data: { applications: ApplicationResponseItem[] } }>(
        "/api/candidate/applications"
      );
      return res.data.applications;
    },
    staleTime: 5 * 1000 * 60, // 5 minutes cache
  });
}

/** Lấy thông tin hồ sơ của ứng viên */
export function useCandidateProfile() {
  return useQuery({
    queryKey: queryKeys.candidate.profile(),
    queryFn: async () => {
      const res = await apiGet<{ success: boolean; data: CandidateProfileData }>("/api/candidate/profile");
      return res.data;
    },
    staleTime: 5 * 1000 * 60, // 5 minutes cache
  });
}

/** Cập nhật thông tin hồ sơ cá nhân */
export function useUpdateCandidateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      email?: string;
      fullName?: string;
      phone?: string | null;
      title?: string | null;
      bio?: string | null;
      location?: string | null;
      years_experience?: number;
      linkedin_url?: string | null;
      github_url?: string | null;
    }) => {
      const res = await apiPost<{ success: boolean }>("/api/candidate/profile", data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidate.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

/** Gửi đơn ứng tuyển */
export function useApplyJob(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      cv_file_url: string;
      cv_filename?: string;
      cover_letter?: string;
    }) => {
      const res = await apiPost<{ success: boolean }>(`/api/jobs/${jobId}/apply`, data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidate.applications() });
    },
  });
}

export type CandidateInterviewItem = {
  id: string;
  application_id: string;
  scheduled_at: string;
  duration_minutes: number;
  type: string;
  status: string;
  meeting_link: string | null;
  location: string | null;
  notes: string | null;
  applications: {
    jobs: {
      id: string;
      title: string;
    };
  };
};

/** Lấy lịch phỏng vấn của ứng viên */
export function useCandidateInterviews() {
  return useQuery({
    queryKey: queryKeys.candidate.interviews(),
    queryFn: async () => {
      const res = await apiGet<{ success: boolean; data: { interviews: CandidateInterviewItem[] } }>(
        "/api/candidate/interviews"
      );
      return res.data.interviews;
    },
    staleTime: 5 * 1000 * 60, // 5 minutes cache
  });
}

/** Thêm file mới vào hồ sơ ứng viên */
export function useAddCandidateFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      file_name: string;
      file_url: string;
      file_type: string;
      appwrite_id?: string;
    }) => {
      const res = await apiPost<{ success: boolean }>("/api/candidate/files", data);
      return res;
    },
    onSuccess: () => {
    },
  });
}
