"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01FreeIcons } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const INTERVIEW_TYPES = [
  { value: "video", label: "Video Call (Online)" },
  { value: "phone", label: "Gọi điện (Phone Call)" },
  { value: "onsite", label: "Trực tiếp tại văn phòng (Onsite)" },
  { value: "technical", label: "Technical Interview" },
];

type SearchParams = Promise<{ applicationId?: string }>;

export default function NewInterviewPage(props: {
  searchParams: SearchParams;
}) {
  const router = useRouter();
  const searchParams = React.use(props.searchParams);
  const initialAppId = searchParams.applicationId || "all";

  const [applicationId, setApplicationId] = useState(initialAppId);
  const [interviewerId, setInterviewerId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [type, setType] = useState("video");
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, setIsPending] = useState(false);

  // Fetch metadata options
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "interviews", "metadata"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/interviews/metadata");
      if (!res.ok) throw new Error("Không thể tải metadata.");
      const json = await res.json();
      return json.data as {
        applications: any[];
        interviewers: any[];
      };
    },
  });

  const applications = data?.applications || [];
  const interviewers = data?.interviewers || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId || applicationId === "all") {
      toast.error("Vui lòng chọn đơn ứng tuyển.");
      return;
    }
    if (!interviewerId) {
      toast.error("Vui lòng chọn người phỏng vấn.");
      return;
    }
    if (!scheduledAt) {
      toast.error("Vui lòng chọn thời gian.");
      return;
    }

    setIsPending(true);
    try {
      const res = await fetch("/api/dashboard/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: applicationId,
          interviewer_id: interviewerId,
          scheduled_at: scheduledAt,
          duration_minutes: parseInt(durationMinutes, 10),
          type,
          meeting_link: meetingLink,
          location,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Không thể lưu lịch phỏng vấn.");
      }

      toast.success("Lên lịch phỏng vấn thành công!");
      router.push("/dashboard/interviews");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi lưu.");
    } finally {
      setIsPending(false);
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
                    {applications.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.users?.fullName} — Vị trí: {app.jobs?.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Người phỏng vấn (Interviewer)</label>
              {isLoading ? (
                <div className="h-10 animate-pulse bg-muted rounded-2xl" />
              ) : (
                <Select value={interviewerId} onValueChange={(val) => setInterviewerId(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn người phỏng vấn" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {interviewers.map((iv) => (
                      <SelectItem key={iv.id} value={iv.id}>
                        {iv.fullName} ({iv.role.toUpperCase()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                disabled={isPending}
                className="flex h-10 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isPending ? "Đang xử lý..." : "Lên lịch"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
