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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { useSendDashboardApplicationEmail } from "@/hooks/use-dashboard-applications";

type SendEmailFormProps = {
  applicationId: string;
  onSuccess?: () => void;
};

export function SendEmailForm({ applicationId, onSuccess }: SendEmailFormProps) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [type, setType] = useState<string>("invite");
  const [bodyText, setBodyText] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const sendEmailMutation = useSendDashboardApplicationEmail(applicationId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!subject.trim() || !type || !bodyText.trim()) {
      setMsg({ type: "error", text: "Vui lòng nhập đầy đủ Tiêu đề, Loại email và Nội dung." });
      return;
    }

    try {
      const res = await sendEmailMutation.mutateAsync({ subject, type, bodyText });
      setMsg({ type: "success", text: res.message || "Gửi email thành công." });
      setSubject("");
      setBodyText("");
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (err: any) {
      console.error("[Send Email Error]", err);
      setMsg({ type: "error", text: err.message || "Không thể gửi email. Vui lòng thử lại." });
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
        <Field className="space-y-1.5">
          <FieldLabel className="text-xs font-medium text-foreground">Loại email</FieldLabel>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full h-10 rounded-2xl bg-background border-input/60">
              <SelectValue placeholder="Chọn loại email" />
            </SelectTrigger>
            <SelectContent position="popper" className="rounded-2xl">
              <SelectItem value="invite">Mời phỏng vấn (Invite)</SelectItem>
              <SelectItem value="result">Kết quả (Result)</SelectItem>
              <SelectItem value="reminder">Nhắc nhở (Reminder)</SelectItem>
              <SelectItem value="rejection">Từ chối (Rejection)</SelectItem>
              <SelectItem value="offer">Lời mời làm việc (Offer)</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field className="space-y-1.5">
          <FieldLabel className="text-xs font-medium text-foreground">Tiêu đề email</FieldLabel>
          <Input
            type="text"
            placeholder="VD: Lịch phỏng vấn vòng 1..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-10"
          />
        </Field>
      </div>

      <Field className="space-y-1.5">
        <FieldLabel className="text-xs font-medium text-foreground">Nội dung email</FieldLabel>
        <Textarea
          rows={5}
          placeholder="Xin chào ứng viên,..."
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
        />
      </Field>

      <div className="flex justify-end pt-2">
        <Button type="submit" size="sm" disabled={sendEmailMutation.isPending}>
          {sendEmailMutation.isPending ? "Đang gửi..." : "Gửi Email"}
        </Button>
      </div>
    </form>
  );
}
