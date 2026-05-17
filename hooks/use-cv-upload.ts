"use client";

import { useState, useEffect, useCallback } from "react";
import { storage, BUCKET_ID, ID } from "@/lib/appwrite";
import { validateCandidateFileSize } from "@/lib/file-upload-limits";

export type NewFileInfo = {
  fileName: string;
  fileUrl: string;
  appwriteId: string;
};

/** Bản ghi file cá nhân từ `GET /api/candidate/files`. */
export type CandidatePersonalFile = {
  id: string;
  file_name: string;
  file_url: string;
  file_type?: string | null;
};

type FilesApiPayload = {
  success?: boolean;
  data?: { files: CandidatePersonalFile[] };
};

export type UseCVUploadOptions = {
  onChange: (url: string) => void;
  onFileNameChange?: (name: string) => void;
  onNewFileUpload?: (file: NewFileInfo | null) => void;
};

export type UseCVUploadReturn = {
  mode: "personal" | "upload";
  switchToPersonal: () => void;
  switchToUpload: () => void;
  personalFiles: CandidatePersonalFile[];
  isFilesLoading: boolean;
  isUploading: boolean;
  uploadError: string | null;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  /** Khi chọn file từ dropdown "File cá nhân". */
  selectPersonalFileUrl: (fileUrl: string) => void;
};

/**
 * State + side effects cho CVUpload: danh sách file cá nhân, upload Appwrite, chế độ personal/upload.
 */
export function useCVUpload({
  onChange,
  onFileNameChange,
  onNewFileUpload,
}: UseCVUploadOptions): UseCVUploadReturn {
  const [mode, setMode] = useState<"personal" | "upload">("personal");
  const [personalFiles, setPersonalFiles] = useState<CandidatePersonalFile[]>([]);
  const [isFilesLoading, setIsFilesLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/candidate/files")
      .then((r) => r.json() as Promise<FilesApiPayload>)
      .then((data) => {
        if (active && data.success && data.data?.files) {
          setPersonalFiles(data.data.files);
        }
      })
      .catch((err) => {
        console.error("[useCVUpload] fetch personal files", err);
      })
      .finally(() => {
        if (active) setIsFilesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const clearControlledFields = useCallback(() => {
    onChange("");
    onFileNameChange?.("");
    onNewFileUpload?.(null);
  }, [onChange, onFileNameChange, onNewFileUpload]);

  const switchToPersonal = useCallback(() => {
    setMode("personal");
    clearControlledFields();
    setUploadError(null);
  }, [clearControlledFields]);

  const switchToUpload = useCallback(() => {
    setMode("upload");
    clearControlledFields();
    setUploadError(null);
  }, [clearControlledFields]);

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const sizeError = validateCandidateFileSize(file);
      if (sizeError) {
        setUploadError(sizeError);
        e.target.value = "";
        return;
      }

      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
      const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
      if (!endpoint || !project || !BUCKET_ID) {
        setUploadError("Cấu hình Appwrite chưa đầy đủ trong file .env");
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const fileResponse = await storage.createFile(BUCKET_ID, ID.unique(), file);
        const fileUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileResponse.$id}/view?project=${project}`;
        onChange(fileUrl);
        onFileNameChange?.(file.name);
        onNewFileUpload?.({
          fileName: file.name,
          fileUrl,
          appwriteId: fileResponse.$id,
        });
      } catch (err: unknown) {
        console.error("[useCVUpload] Appwrite upload", err);
        const message = err instanceof Error ? err.message : "Không thể tải file lên Appwrite";
        setUploadError(message);
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, onFileNameChange, onNewFileUpload],
  );

  const selectPersonalFileUrl = useCallback(
    (fileUrl: string) => {
      onChange(fileUrl);
      const selected = personalFiles.find((f) => f.file_url === fileUrl);
      if (selected) onFileNameChange?.(selected.file_name);
      onNewFileUpload?.(null);
    },
    [personalFiles, onChange, onFileNameChange, onNewFileUpload],
  );

  return {
    mode,
    switchToPersonal,
    switchToUpload,
    personalFiles,
    isFilesLoading,
    isUploading,
    uploadError,
    handleFileInputChange,
    selectPersonalFileUrl,
  };
}
