"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatusForm } from "./status-form";

type StatusOption = { value: string; label: string; variant?: string };

type StatusUpdateDialogProps = {
  applicationId: string;
  currentStatus: string;
  statusOptions: StatusOption[];
  /** Gọi sau khi đóng dialog thành công để refetch dữ liệu (vd. invalidate React Query). */
  onDataChanged?: () => void;
};

/**
 * Nút + modal cập nhật trạng thái đơn (dùng trong tab Lịch sử).
 */
export function StatusUpdateDialog({
  applicationId,
  currentStatus,
  statusOptions,
  onDataChanged,
}: StatusUpdateDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="shrink-0 rounded-xl">
          Cập nhật trạng thái
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái đơn</DialogTitle>
          <DialogDescription>
            Chọn trạng thái mới và đính kèm ghi chú audit.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          <StatusForm
            key={`${applicationId}-${currentStatus}`}
            applicationId={applicationId}
            currentStatus={currentStatus}
            statusOptions={statusOptions}
            onSuccess={() => {
              setOpen(false);
              onDataChanged?.();
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
