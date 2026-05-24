import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut, apiPost } from "@/lib/api-client";

export interface DashboardUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: "candidate" | "admin" | "hr" | "interviewer";
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useDashboardUsers() {
  return useQuery<DashboardUser[]>({
    queryKey: ["dashboard", "users"],
    queryFn: async () => {
      const response = await apiGet<{ success: boolean; data: DashboardUser[] }>("/api/users");
      return response.data;
    },
  });
}

export function useUpdateDashboardUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      role,
      isActive,
    }: {
      id: string;
      role?: string;
      isActive?: boolean;
    }) => {
      const response = await apiPut<{ success: boolean; data: DashboardUser }>(
        `/api/users/${id}`,
        { role, isActive }
      );
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "users"] });
    },
  });
}

export function useCreateDashboardUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      fullName: string;
      email: string;
      password?: string;
      phone?: string;
      role: string;
    }) => {
      const response = await apiPost<{ success: boolean; data: DashboardUser }>(
        "/api/users",
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "users"] });
    },
  });
}
