import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiPut } from "@/lib/api-client";
import { queryKeys } from "@/hooks/query-keys";
import { storage, BUCKET_ID, ID } from "@/lib/appwrite";
import { toast } from "sonner";

import type { MeResponse } from "@/types/api";
import type { PublicUser } from "@/types/api";

/**
 * Lấy user đang đăng nhập từ /api/auth/me.
 * - Trả về null khi chưa đăng nhập (401) — không throw.
 * - staleTime 5 phút: tránh refetch liên tục giữa các page navigate.
 * - retry: false — lỗi 401 không nên retry.
 */
export function useMe() {
  return useQuery<PublicUser | null>({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      try {
        const data = await apiGet<MeResponse>("/api/auth/me");
        return data.data.user;
      } catch {
        // 401 → user chưa đăng nhập, trả null thay vì ném lỗi
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 phút
    retry: false,
  });
}

/**
 * Cập nhật thông tin cá nhân hoặc đổi mật khẩu cho user hiện tại.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      fullName?: string;
      email?: string;
      phone?: string;
      avatarUrl?: string;
      currentPassword?: string;
      newPassword?: string;
    }) => {
      const response = await apiPut<MeResponse>("/api/auth/me", payload);
      return response.data.user;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

/**
 * Tải lên ảnh đại diện mới, cập nhật hồ sơ người dùng và tự động dọn dẹp ảnh cũ.
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const uploadAvatar = async (fileObj: File) => {
    if (!fileObj.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp tin hình ảnh hợp lệ (PNG, JPG, WEBP, ...).");
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (fileObj.size > maxSize) {
      toast.error("Kích thước ảnh đại diện không được vượt quá 5MB.");
      return;
    }

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
    if (!endpoint || !project || !BUCKET_ID) {
      toast.error("Cấu hình Appwrite chưa đầy đủ.");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Tìm kiếm ảnh đại diện cũ
      const filesRes = await fetch("/api/candidate/files");
      let oldAvatarId: string | null = null;
      if (filesRes.ok) {
        const filesData = await filesRes.json();
        if (filesData.success && Array.isArray(filesData.data?.files)) {
          const oldAvatar = filesData.data.files.find(
            (f: any) => f.file_type === "avatar"
          );
          if (oldAvatar) {
            oldAvatarId = oldAvatar.id;
          }
        }
      }

      // 2. Upload file mới lên Appwrite
      const fileResponse = await storage.createFile(BUCKET_ID, ID.unique(), fileObj);
      const fileUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileResponse.$id}/view?project=${project}`;

      // 3. Tạo bản ghi files mới với type = 'avatar'
      const dbFileRes = await fetch("/api/candidate/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_name: fileObj.name,
          file_url: fileUrl,
          file_type: "avatar",
          appwrite_id: fileResponse.$id,
        }),
      });

      if (!dbFileRes.ok) {
        throw new Error("Không thể lưu thông tin ảnh đại diện vào hệ thống.");
      }

      // 4. Cập nhật avatarUrl của user hiện tại
      const updateRes = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: fileUrl }),
      });

      if (!updateRes.ok) {
        throw new Error("Không thể cập nhật ảnh đại diện vào tài khoản.");
      }

      // 5. Xóa ảnh cũ nếu có
      if (oldAvatarId) {
        await fetch(`/api/candidate/files/${oldAvatarId}`, { method: "DELETE" });
      }

      toast.success("Cập nhật ảnh đại diện thành công!");
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.candidate.profile() });
    } catch (err: any) {
      console.error("[uploadAvatar] error", err);
      toast.error(err.message || "Đã xảy ra lỗi khi tải ảnh đại diện lên.");
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadAvatar, isUploading };
}
