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

type SelectedEvaluator = {
  user_id: string;
  role: "evaluator" | "observer" | "final_reviewer";
};

type Props = {
  applicationId: string;
  interviewers: Interviewer[];
  onSuccess?: () => void;
};

export function CreateInterviewForm({ applicationId, interviewers, onSuccess }: Props) {
  const router = useRouter();

  const [evaluators, setEvaluators] = useState<SelectedEvaluator[]>([
    { user_id: "", role: "final_reviewer" },
  ]);
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

    const activeEvaluators = evaluators.filter((ev) => ev.user_id !== "");
    if (activeEvaluators.length === 0) {
      setMsg({ type: "error", text: "Vui lòng chọn ít nhất một người phỏng vấn." });
      return;
    }

    const userIds = activeEvaluators.map((ev) => ev.user_id);
    if (userIds.length !== new Set(userIds).size) {
      setMsg({ type: "error", text: "Trùng lặp người phỏng vấn. Mỗi thành viên chỉ được gán một vai trò." });
      return;
    }

    const finalReviewers = activeEvaluators.filter((ev) => ev.role === "final_reviewer");
    if (finalReviewers.length !== 1) {
      setMsg({ type: "error", text: "Buổi phỏng vấn phải có đúng 1 người đánh giá cuối cùng (Final Reviewer)." });
      return;
    }

    if (!scheduledAt || !type) {
      setMsg({ type: "error", text: "Vui lòng điền đầy đủ các trường thông tin bắt buộc (*)." });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/dashboard/applications/${applicationId}/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evaluators: activeEvaluators,
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
        setEvaluators([{ user_id: "", role: "final_reviewer" }]);
        setScheduledAt("");
        setMeetingLink("");
        setLocation("");
        setNotes("");
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        setMsg({ type: "error", text: data.message || "Không thể tạo lịch phỏng vấn." });
      }
    } catch (err: unknown) {
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

      {/* Evaluators selection section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground">
            Hội đồng phỏng vấn <span className="text-destructive">*</span>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEvaluators([...evaluators, { user_id: "", role: "evaluator" }])}
            className="h-8 rounded-xl text-xs"
          >
            + Thêm người phỏng vấn
          </Button>
        </div>

        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
          {evaluators.map((ev, index) => (
            <div key={index} className="flex gap-2 items-end bg-muted/20 p-2.5 rounded-xl border border-border/40">
              <div className="flex-1 min-w-[150px]">
                <span className="text-[10px] text-muted-foreground font-medium block mb-1">Thành viên phỏng vấn</span>
                <Select
                  value={ev.user_id}
                  onValueChange={(val) => {
                    const next = [...evaluators];
                    next[index].user_id = val;
                    setEvaluators(next);
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-xs">
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
              </div>

              <div className="w-[140px] shrink-0">
                <span className="text-[10px] text-muted-foreground font-medium block mb-1">Vai trò</span>
                <Select
                  value={ev.role}
                  onValueChange={(val: any) => {
                    const next = [...evaluators];
                    next[index].role = val;
                    setEvaluators(next);
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="evaluator">Evaluator (Chấm điểm)</SelectItem>
                    <SelectItem value="observer">Observer (Quan sát)</SelectItem>
                    <SelectItem value="final_reviewer">Final Reviewer (Kết luận)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {evaluators.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => {
                    setEvaluators(evaluators.filter((_, i) => i !== index));
                  }}
                >
                  Xóa
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field>
          <FieldLabel className="text-xs font-medium text-foreground">
            Hình thức <span className="text-destructive">*</span>
          </FieldLabel>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full h-10">
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
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
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
      </div>

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
        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? "Đang xử lý..." : "Lên lịch phỏng vấn"}
        </Button>
      </div>
    </form>
  );
}
