"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01FreeIcons } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useDashboardInterviewMetadata,
  useCreateDashboardInterview,
} from "@/hooks/use-dashboard-interviews";

const INTERVIEW_TYPES = [
  { value: "video", label: "Video Call (Online)" },
  { value: "phone", label: "Gọi điện (Phone Call)" },
  { value: "onsite", label: "Trực tiếp tại văn phòng (Onsite)" },
  { value: "technical", label: "Technical Interview" },
];

type SearchParams = Promise<{ applicationId?: string }>;

type SelectedEvaluator = {
  user_id: string;
  role: "evaluator" | "observer" | "final_reviewer";
};

export default function NewInterviewPage(props: {
  searchParams: SearchParams;
}) {
  const router = useRouter();
  const searchParams = React.use(props.searchParams);
  const initialAppId = searchParams.applicationId || "all";

  const [applicationId, setApplicationId] = useState(initialAppId);
  const [evaluators, setEvaluators] = useState<SelectedEvaluator[]>([
    { user_id: "", role: "final_reviewer" },
  ]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [type, setType] = useState("video");
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const { data, isLoading } = useDashboardInterviewMetadata();
  const createMutation = useCreateDashboardInterview();

  const applications = data?.applications || [];
  const interviewers = data?.interviewers || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId || applicationId === "all") {
      toast.error("Vui lòng chọn đơn ứng tuyển.");
      return;
    }

    const activeEvaluators = evaluators.filter((ev) => ev.user_id !== "");
    if (activeEvaluators.length === 0) {
      toast.error("Vui lòng chọn ít nhất một người phỏng vấn.");
      return;
    }

    const userIds = activeEvaluators.map((ev) => ev.user_id);
    if (userIds.length !== new Set(userIds).size) {
      toast.error("Trùng lặp người phỏng vấn. Mỗi thành viên chỉ được gán một vai trò.");
      return;
    }

    const finalReviewers = activeEvaluators.filter((ev) => ev.role === "final_reviewer");
    if (finalReviewers.length !== 1) {
      toast.error("Buổi phỏng vấn phải có đúng 1 người đánh giá cuối cùng (Final Reviewer).");
      return;
    }

    if (!scheduledAt) {
      toast.error("Vui lòng chọn thời gian.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        application_id: applicationId,
        evaluators: activeEvaluators,
        scheduled_at: scheduledAt,
        duration_minutes: parseInt(durationMinutes, 10),
        type: type as any,
        meeting_link: meetingLink || null,
        location: location || null,
        notes: notes || null,
      } as any);

      toast.success("Lên lịch phỏng vấn thành công!");
      router.push("/dashboard/interviews");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi lưu.");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/interviews"
          className="inline-flex h-9 items-center justify-center rounded-2xl border border-input/60 bg-background px-4 text-xs font-medium text-foreground hover:bg-muted transition-all gap-1.5"
        >
          <HugeiconsIcon icon={ArrowLeft01FreeIcons} className="size-4" /> Quay lại danh sách
        </Link>
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-xl">Lên lịch phỏng vấn mới</CardTitle>
          <CardDescription className="text-sm">
            Chọn ứng viên, phỏng vấn viên, và thiết lập thông tin thời gian, hình thức.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Ứng viên & Đơn ứng tuyển</label>
              {isLoading ? (
                <div className="h-10 animate-pulse bg-muted rounded-2xl" />
              ) : (
                <Select value={applicationId} onValueChange={(val) => setApplicationId(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn ứng viên" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all">Chọn ứng viên</SelectItem>
                    {applications.map((app: any) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.users?.fullName} — Vị trí: {app.jobs?.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Evaluators Selection List */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Hội đồng phỏng vấn <span className="text-destructive">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setEvaluators([...evaluators, { user_id: "", role: "evaluator" }])}
                  className="inline-flex h-8 items-center justify-center rounded-xl border border-input px-3 text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
                >
                  + Thêm người phỏng vấn
                </button>
              </div>

              {isLoading ? (
                <div className="h-20 animate-pulse bg-muted rounded-2xl" />
              ) : (
                <div className="space-y-3">
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
                          <SelectTrigger className="w-full h-10">
                            <SelectValue placeholder="Chọn người phỏng vấn" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {interviewers.map((iv: any) => (
                              <SelectItem key={iv.id} value={iv.id}>
                                {iv.fullName} ({iv.role.toUpperCase()})
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
                          <SelectTrigger className="w-full h-10">
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="evaluator">Evaluator (Chấm điểm)</SelectItem>
                            <SelectItem value="observer">Observer (Quan sát)</SelectItem>
                            <SelectItem value="final_reviewer">Final Reviewer (Kết luận)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {evaluators.length > 1 && (
                        <button
                          type="button"
                          className="flex h-10 w-10 items-center justify-center rounded-2xl text-destructive hover:bg-destructive/10 shrink-0 transition-colors cursor-pointer"
                          onClick={() => {
                            setEvaluators(evaluators.filter((_, i) => i !== index));
                          }}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Thời gian phỏng vấn</label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="rounded-2xl h-10 px-3 border border-input/60 bg-background"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Thời lượng (Phút)</label>
                <Input
                  type="number"
                  min={15}
                  max={300}
                  step={15}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="rounded-2xl h-10 px-3 border border-input/60 bg-background"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Hình thức phỏng vấn</label>
              <Select value={type} onValueChange={(val) => setType(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn hình thức" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {INTERVIEW_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === "video" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Link họp trực tuyến (Google Meet / Zoom...)</label>
                <Input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="rounded-2xl h-10 px-3 border border-input/60 bg-background"
                />
              </div>
            )}

            {(type === "onsite" || type === "technical") && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Địa điểm / Phòng họp</label>
                <Input
                  type="text"
                  placeholder="Tầng 5, Phòng họp A..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="rounded-2xl h-10 px-3 border border-input/60 bg-background"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Ghi chú (Tùy chọn)</label>
              <Textarea
                rows={3}
                placeholder="Chuẩn bị bài test, ghi chú cho ứng viên..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-2xl p-3 border border-input/60 bg-background"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex h-10 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {createMutation.isPending ? "Đang xử lý..." : "Lên lịch"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
