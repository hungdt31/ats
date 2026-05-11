"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type StatusFormProps = {
  applicationId: string;
  currentStatus: string;
  statusOptions: { value: string; label: string }[];
  /** Gọi sau khi cập nhật thành công (vd. đóng Dialog). */
  onSuccess?: () => void;
};

export function StatusForm({ applicationId, currentStatus, statusOptions, onSuccess }: StatusFormProps) {
  const router = useRouter();
  const [toStatus, setToStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toStatus) {
      toast.error("Vui lòng chọn trạng thái mới.");
      return;
    }

    setIsPending(true);
    try {
      const res = await fetch(`/api/dashboard/applications/${applicationId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_status: toStatus, note }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Không thể cập nhật trạng thái.");
      }

      toast.success("Cập nhật trạng thái thành công!");
      setNote("");
      onSuccess?.();
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-foreground">Chọn trạng thái mới</label>
        <Select value={toStatus} onValueChange={(val) => setToStatus(val)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-foreground">Ghi chú audit (Tùy chọn)</label>
        <Textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Lý do chuyển trạng thái, ghi chú chi tiết..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex h-9 items-center justify-center rounded-2xl bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isPending ? "Đang cập nhật..." : "Cập nhật trạng thái"}
        </button>
      </div>
    </form>
  );
}
