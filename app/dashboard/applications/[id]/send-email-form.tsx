"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SendEmailFormProps = {
  applicationId: string;
  onSuccess?: () => void;
};

export function SendEmailForm({ applicationId, onSuccess }: SendEmailFormProps) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [type, setType] = useState<string>("invite");
  const [bodyText, setBodyText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!subject.trim() || !type || !bodyText.trim()) {
      setMsg({ type: "error", text: "Vui lòng nhập đầy đủ Tiêu đề, Loại email và Nội dung." });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/dashboard/applications/${applicationId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, type, bodyText }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMsg({ type: "success", text: data.message || "Gửi email thành công." });
        setSubject("");
        setBodyText("");
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        setMsg({ type: "error", text: data.message || "Không thể gửi email. Vui lòng thử lại." });
      }
    } catch (err: any) {
      console.error("[Send Email Error]", err);
      setMsg({ type: "error", text: "Đã xảy ra lỗi khi gửi email." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {msg && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs ${
            msg.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Loại email</label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full h-10 rounded-xl bg-background border-border/60">
              <SelectValue placeholder="Chọn loại email" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="invite">Mời phỏng vấn (Invite)</SelectItem>
              <SelectItem value="result">Kết quả (Result)</SelectItem>
              <SelectItem value="reminder">Nhắc nhở (Reminder)</SelectItem>
              <SelectItem value="rejection">Từ chối (Rejection)</SelectItem>
              <SelectItem value="offer">Lời mời làm việc (Offer)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Tiêu đề email</label>
          <input
            type="text"
            placeholder="VD: Lịch phỏng vấn vòng 1..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Nội dung email</label>
        <textarea
          rows={5}
          placeholder="Xin chào ứng viên,..."
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          className="flex w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading ? "Đang gửi..." : "Gửi Email"}
        </Button>
      </div>
    </form>
  );
}
