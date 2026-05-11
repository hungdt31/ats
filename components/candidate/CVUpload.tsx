"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCVUpload,
  type NewFileInfo,
  type CandidatePersonalFile,
} from "@/hooks/use-cv-upload";

export type { NewFileInfo, CandidatePersonalFile };

type CVUploadProps = {
  value: string;
  onChange: (url: string) => void;
  onFileNameChange?: (name: string) => void;
  onNewFileUpload?: (file: NewFileInfo | null) => void;
};

export function CVUpload({ value, onChange, onFileNameChange, onNewFileUpload }: CVUploadProps) {
  const {
    mode,
    switchToPersonal,
    switchToUpload,
    personalFiles,
    isFilesLoading,
    isUploading,
    uploadError,
    handleFileInputChange,
    selectPersonalFileUrl,
  } = useCVUpload({ onChange, onFileNameChange, onNewFileUpload });

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
            onClick={switchToPersonal}
          >
            File cá nhân
          </Button>
          <Button
            type="button"
            variant="link"
            className={`h-auto p-0 text-xs font-medium underline ${
              mode === "upload" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={switchToUpload}
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
              onValueChange={selectPersonalFileUrl}
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
            onChange={handleFileInputChange}
            disabled={isUploading}
            className="flex w-full rounded-2xl border border-dashed border-border bg-input/20 px-4 py-3 text-sm transition-all focus:border-ring focus:outline-none file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-semibold file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
          />
          {isUploading && (
            <p className="text-xs text-muted-foreground animate-pulse">Đang tải file lên Appwrite...</p>
          )}
          {value && (
            <p className="flex items-start gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium break-all whitespace-normal">
              <HugeiconsIcon icon={Tick02Icon} className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span>Đã tải lên thành công.</span>
            </p>
          )}
          {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
        </div>
      )}
    </div>
  );
}
