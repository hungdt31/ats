"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Interviewer = {
  id: string;
  fullName: string;
  email: string;
};

type Props = {
  applicationId: string;
  interviewers: Interviewer[];
  onSuccess?: () => void;
};

export function CreateInterviewForm({ applicationId, interviewers, onSuccess }: Props) {
  const router = useRouter();

  const [interviewerId, setInterviewerId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [type, setType] = useState<string>("video");
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!interviewerId || !scheduledAt || !type) {
      setMsg({ type: "error", text: "Vui lòng điền đầy đủ các trường thông tin bắt buộc (*)." });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/dashboard/applications/${applicationId}/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewer_id: interviewerId,
          scheduled_at: scheduledAt,
          duration_minutes: parseInt(durationMinutes) || 60,
          type,
          meeting_link: meetingLink || undefined,
          location: location || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMsg({ type: "success", text: data.message || "Tạo lịch phỏng vấn thành công." });
        setInterviewerId("");
        setScheduledAt("");
        setMeetingLink("");
        setLocation("");
        setNotes("");
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        setMsg({ type: "error", text: data.message || "Không thể tạo lịch phỏng vấn." });
      }
    } catch (err: any) {
      console.error("[Create Interview Error]", err);
      setMsg({ type: "error", text: "Đã xảy ra lỗi khi tạo lịch phỏng vấn." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto px-1 py-1">
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
        <Field>
          <FieldLabel className="text-xs font-medium text-foreground">
            Người phỏng vấn <span className="text-destructive">*</span>
          </FieldLabel>
          <Select value={interviewerId} onValueChange={setInterviewerId}>
            <SelectTrigger className="w-full h-10 rounded-xl bg-background border-border/60">
              <SelectValue placeholder="Chọn người phỏng vấn" />
            </SelectTrigger>
            <SelectContent position="popper">
              {interviewers.map((iv) => (
                <SelectItem key={iv.id} value={iv.id}>
                  {iv.fullName} ({iv.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel className="text-xs font-medium text-foreground">
            Hình thức <span className="text-destructive">*</span>
          </FieldLabel>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full h-10 rounded-xl bg-background border-border/60">
              <SelectValue placeholder="Chọn hình thức" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="video">Online (Video Call)</SelectItem>
              <SelectItem value="phone">Gọi điện (Phone Call)</SelectItem>
              <SelectItem value="onsite">Trực tiếp (Onsite)</SelectItem>
              <SelectItem value="technical">Kỹ thuật (Technical)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field>
          <FieldLabel className="text-xs font-medium text-foreground">
            Thời gian phỏng vấn <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs font-medium text-foreground">
            Thời lượng (phút) <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            type="number"
            min="1"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
          />
        </Field>
      </div>

      <Field>
        <FieldLabel className="text-xs font-medium text-foreground">
          Link phỏng vấn trực tuyến (Nếu có)
        </FieldLabel>
        <Input
          type="url"
          placeholder="VD: https://meet.google.com/..."
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel className="text-xs font-medium text-foreground">
          Địa điểm phỏng vấn (Nếu có)
        </FieldLabel>
        <Input
          type="text"
          placeholder="VD: Phòng 402, Tòa nhà ABC..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel className="text-xs font-medium text-foreground">Ghi chú từ HR</FieldLabel>
        <Textarea
          rows={3}
          placeholder="Thông tin thêm dành cho ứng viên và interviewer..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>

      <div className="flex justify-end pt-2">
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading ? "Đang xử lý..." : "Lên lịch phỏng vấn"}
        </Button>
      </div>
    </form>
  );
}
