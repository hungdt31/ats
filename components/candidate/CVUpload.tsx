"use client";

import { useState, useEffect } from "react";
import { storage, BUCKET_ID, ID } from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type NewFileInfo = {
  fileName: string;
  fileUrl: string;
  appwriteId: string;
};

type CVUploadProps = {
  value: string;
  onChange: (url: string) => void;
  onFileNameChange?: (name: string) => void;
  onNewFileUpload?: (file: NewFileInfo | null) => void;
};

export function CVUpload({ value, onChange, onFileNameChange, onNewFileUpload }: CVUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"personal" | "upload">("personal");
  
  const [personalFiles, setPersonalFiles] = useState<any[]>([]);
  const [isFilesLoading, setIsFilesLoading] = useState(false);

  // Fetch candidate's files from the system
  useEffect(() => {
    async function fetchFiles() {
      setIsFilesLoading(true);
      try {
        const res = await fetch("/api/candidate/files");
        const data = await res.json();
        if (res.ok && data.success) {
          setPersonalFiles(data.data.files);
        }
      } catch (err) {
        console.error("[Fetch CVUpload files error]", err);
      } finally {
        setIsFilesLoading(false);
      }
    }

    fetchFiles();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check configuration
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
    if (!endpoint || !project || !BUCKET_ID) {
      setError("Cấu hình Appwrite chưa đầy đủ trong file .env");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const fileResponse = await storage.createFile(BUCKET_ID, ID.unique(), file);
      const fileUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileResponse.$id}/view?project=${project}`;
      onChange(fileUrl);
      if (onFileNameChange) {
        onFileNameChange(file.name);
      }

      // Invoke callback if provided (to register when applying successfully)
      if (onNewFileUpload) {
        onNewFileUpload({
          fileName: file.name,
          fileUrl: fileUrl,
          appwriteId: fileResponse.$id,
        });
      }
    } catch (err: any) {
      console.error("[CV Upload Error]", err);
      setError(err.message || "Không thể tải file lên Appwrite");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">
          {mode === "personal"
            ? "Chọn CV từ file cá nhân của bạn"
            : "Tải file CV mới lên Appwrite"}{" "}
          <span className="text-destructive">*</span>
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="link"
            className={`h-auto p-0 text-xs font-medium underline ${
              mode === "personal" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => {
              setMode("personal");
              onChange("");
              if (onFileNameChange) onFileNameChange("");
              if (onNewFileUpload) onNewFileUpload(null);
              setError(null);
            }}
          >
            File cá nhân
          </Button>
          <Button
            type="button"
            variant="link"
            className={`h-auto p-0 text-xs font-medium underline ${
              mode === "upload" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => {
              setMode("upload");
              onChange("");
              if (onFileNameChange) onFileNameChange("");
              if (onNewFileUpload) onNewFileUpload(null);
              setError(null);
            }}
          >
            Upload mới
          </Button>
        </div>
      </div>

      {mode === "personal" ? (
        <div className="space-y-2">
          {isFilesLoading ? (
            <p className="text-xs text-muted-foreground animate-pulse">Đang tải danh sách file cá nhân...</p>
          ) : personalFiles.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Bạn chưa có file cá nhân nào. Hãy chuyển sang <strong>Upload mới</strong> để tải lên.
            </p>
          ) : (
            <Select
              value={value}
              onValueChange={(val) => {
                onChange(val);
                const selectedFile = personalFiles.find((f) => f.file_url === val);
                if (selectedFile && onFileNameChange) {
                  onFileNameChange(selectedFile.file_name);
                }
                if (onNewFileUpload) onNewFileUpload(null); // Clear new file callback
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn file cá nhân của bạn" />
              </SelectTrigger>
              <SelectContent position="popper">
                {personalFiles.map((file) => (
                  <SelectItem key={file.id} value={file.file_url}>
                    {file.file_name} ({file.file_type || "cv"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="flex w-full rounded-2xl border border-dashed border-border bg-input/20 px-4 py-3 text-sm transition-all focus:border-ring focus:outline-none file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-semibold file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
          />
          {isUploading && (
            <p className="text-xs text-muted-foreground animate-pulse">Đang tải file lên Appwrite...</p>
          )}
          {value && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium break-all whitespace-normal">
              ✓ Đã tải lên thành công.
            </p>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    </div>
  );
}
