"use client";

import { useState, useEffect, useCallback } from "react";
import { storage, BUCKET_ID, ID } from "@/lib/appwrite";

export type CandidateFile = {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  appwrite_id: string | null;
};

type Msg = { type: "success" | "error"; text: string };

type FilesApiResponse = {
  success: boolean;
  data: { files: CandidateFile[] };
};

export type UseCandidateFilesReturn = {
  files: CandidateFile[];
  isLoading: boolean;
  isUploading: boolean;
  msg: Msg | null;
  editingFile: CandidateFile | null;
  editFileName: string;
  setEditingFile: (file: CandidateFile | null) => void;
  setEditFileName: (name: string) => void;
  clearMsg: () => void;
  refresh: () => Promise<void>;
  uploadFile: (fileObj: File) => Promise<void>;
  renameFile: (fileId: string, name: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
};

/**
 * Quản lý danh sách tệp cá nhân của ứng viên.
 * Bao gồm: tải danh sách, upload, đổi tên, xóa.
 */
export function useCandidateFiles(): UseCandidateFilesReturn {
  const [files, setFiles] = useState<CandidateFile[]>([]);
  // Khởi tạo true để hiển thị skeleton ngay khi mount
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [editingFile, setEditingFile] = useState<CandidateFile | null>(null);
  const [editFileName, setEditFileName] = useState("");

  /** Re-fetch danh sách sau khi mutation thành công (không cần loading spinner). */
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/candidate/files");
      const data = await res.json() as FilesApiResponse;
      if (res.ok && data.success) setFiles(data.data.files);
    } catch (err) {
      console.error("[useCandidateFiles] refresh error", err);
    }
  }, []);

  /** Initial load: setState nằm trong promise callbacks, tránh cảnh báo React Compiler. */
  useEffect(() => {
    let active = true;
    fetch("/api/candidate/files")
      .then((r) => r.json() as Promise<FilesApiResponse>)
      .then((data) => { if (active && data.success) setFiles(data.data.files); })
      .catch((err) => console.error("[useCandidateFiles] initial load error", err))
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  /** Upload tệp lên Appwrite rồi lưu vào DB. */
  async function uploadFile(fileObj: File) {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
    if (!endpoint || !project || !BUCKET_ID) {
      setMsg({ type: "error", text: "Cấu hình Appwrite chưa đầy đủ trong file .env" });
      return;
    }

    setIsUploading(true);
    setMsg(null);
    try {
      const fileResponse = await storage.createFile(BUCKET_ID, ID.unique(), fileObj);
      const fileUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileResponse.$id}/view?project=${project}`;

      const res = await fetch("/api/candidate/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_name: fileObj.name,
          file_url: fileUrl,
          file_type: "cv",
          appwrite_id: fileResponse.$id,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { message?: string };
        setMsg({ type: "error", text: data.message ?? "Không thể lưu tệp vào hệ thống" });
      } else {
        setMsg({ type: "success", text: "Tải tệp lên thành công" });
        await refresh();
      }
    } catch (err) {
      setMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Lỗi khi tải tệp lên",
      });
    } finally {
      setIsUploading(false);
    }
  }

  /** Đổi tên tệp. */
  async function renameFile(fileId: string, name: string) {
    try {
      const res = await fetch(`/api/candidate/files/${fileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_name: name }),
      });
      if (res.ok) {
        setMsg({ type: "success", text: "Đổi tên tệp thành công" });
        setEditingFile(null);
        await refresh();
      }
    } catch {
      setMsg({ type: "error", text: "Không thể đổi tên tệp" });
    }
  }

  /** Xóa tệp. */
  async function deleteFile(fileId: string) {
    try {
      const res = await fetch(`/api/candidate/files/${fileId}`, { method: "DELETE" });
      if (res.ok) {
        setMsg({ type: "success", text: "Xóa tệp thành công" });
        await refresh();
      }
    } catch {
      setMsg({ type: "error", text: "Không thể xóa tệp" });
    }
  }

  return {
    files,
    isLoading,
    isUploading,
    msg,
    editingFile,
    editFileName,
    setEditingFile,
    setEditFileName,
    clearMsg: () => setMsg(null),
    refresh,
    uploadFile,
    renameFile,
    deleteFile,
  };
}
