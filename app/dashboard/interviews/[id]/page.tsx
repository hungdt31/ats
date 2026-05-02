"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Đã lên lịch", variant: "outline" as const },
  { value: "completed", label: "Hoàn thành", variant: "default" as const },
  { value: "cancelled", label: "Huỷ bỏ", variant: "destructive" as const },
  { value: "rescheduled", label: "Dời lịch", variant: "secondary" as const },
];

type Params = Promise<{ id: string }>;

export default function InterviewDetailPage(props: { params: Params }) {
  const router = useRouter();
  const params = React.use(props.params);
  const interviewId = params.id;
  const [isUpdating, setIsUpdating] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dashboard", "interviews", interviewId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/interviews/${interviewId}`);
      if (!res.ok) throw new Error("Không thể tải thông tin.");
      const json = await res.json();
      return json.data;
    },
  });

  const handleUpdateStatus = async (status: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/dashboard/interviews/${interviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Lỗi cập nhật trạng thái.");
      }

      toast.success("Cập nhật trạng thái thành công!");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto py-12 text-center text-muted-foreground">
        Đang tải thông tin buổi phỏng vấn...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto py-12 text-center text-destructive">
        Không tìm thấy thông tin buổi phỏng vấn.
      </div>
    );
  }

  const currentStatusConfig = STATUS_OPTIONS.find((s) => s.value === data.status) || STATUS_OPTIONS[0];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/interviews"
            className="inline-flex h-9 items-center justify-center rounded-2xl border border-input/60 bg-background px-4 text-xs font-medium text-foreground hover:bg-muted transition-all"
          >
            ← Quay lại lịch trình
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st.value}
              disabled={isUpdating || data.status === st.value}
              onClick={() => handleUpdateStatus(st.value)}
              className="inline-flex h-9 items-center justify-center rounded-2xl border border-input bg-background px-3 text-xs font-medium text-foreground hover:bg-muted transition-all disabled:opacity-50 cursor-pointer"
            >
              Đổi sang {st.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Chi tiết</CardTitle>
                <Badge variant={currentStatusConfig.variant}>{currentStatusConfig.label}</Badge>
              </div>
              <CardDescription className="text-xs uppercase">
                {data.type} phỏng vấn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Ứng viên</span>
                <span className="font-semibold text-foreground">
                  {data.applications?.users?.fullName || "—"}
                </span>
                <span className="text-xs text-muted-foreground block">
                  Email: {data.applications?.users?.email}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-xs">Vị trí ứng tuyển</span>
                <span className="font-medium text-foreground">
                  {data.applications?.jobs?.title || "—"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-xs">Người phỏng vấn</span>
                <span className="font-medium text-foreground">{data.users?.fullName}</span>
              </div>

              <Separator />

              <div>
                <span className="text-muted-foreground block text-xs">Thời gian</span>
                <span className="font-semibold text-foreground">
                  {new Date(data.scheduled_at).toLocaleString("vi-VN")}
                </span>
                <span className="text-xs text-muted-foreground block">
                  Thời lượng: {data.duration_minutes} phút
                </span>
              </div>

              {data.meeting_link && (
                <div>
                  <span className="text-muted-foreground block text-xs">Link tham gia trực tuyến</span>
                  <a
                    href={data.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all block text-xs"
                  >
                    {data.meeting_link}
                  </a>
                </div>
              )}

              {data.location && (
                <div>
                  <span className="text-muted-foreground block text-xs">Địa điểm</span>
                  <span className="font-medium text-foreground">{data.location}</span>
                </div>
              )}

              {data.notes && (
                <div>
                  <span className="text-muted-foreground block text-xs">Ghi chú HR</span>
                  <p className="text-xs text-foreground bg-muted/40 p-3 rounded-xl border border-border/30 whitespace-pre-wrap leading-relaxed">
                    {data.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column scorecard */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/80">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
              <div>
                <CardTitle className="text-lg">Bảng điểm đánh giá (Scorecard)</CardTitle>
                <CardDescription className="text-xs">
                  Kết quả đánh giá từ phỏng vấn viên.
                </CardDescription>
              </div>
              <Link
                href={`/dashboard/interviews/${interviewId}/score`}
                className="inline-flex h-9 items-center justify-center rounded-2xl bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
              >
                + Thêm đánh giá / Chấm điểm
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.interview_scores && data.interview_scores.length > 0 ? (
                <div className="space-y-4">
                  {data.interview_scores.map((score: any) => (
                    <div key={score.id} className="p-4 bg-muted/30 rounded-2xl border border-border/40 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-foreground text-sm block">
                            {score.users?.fullName || "—"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Interviewer
                          </span>
                        </div>
                        <Badge variant={score.result === "pass" ? "default" : score.result === "hold" ? "secondary" : "destructive"}>
                          Kết quả: {score.result?.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-background p-3 rounded-xl border border-border/30 text-xs">
                        <div>
                          <span className="text-muted-foreground block">Kỹ thuật</span>
                          <span className="font-bold text-foreground text-sm">{score.technical_score}/10</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Giao tiếp</span>
                          <span className="font-bold text-foreground text-sm">{score.communication_score}/10</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Cultural Fit</span>
                          <span className="font-bold text-foreground text-sm">{score.cultural_fit_score}/10</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Điểm chung</span>
                          <span className="font-bold text-foreground text-sm">{score.overall_score}/10</span>
                        </div>
                      </div>

                      {score.strengths && (
                        <div className="space-y-1">
                          <span className="text-muted-foreground block text-xs font-medium">Điểm mạnh</span>
                          <p className="text-xs text-foreground bg-background p-2.5 rounded-xl border border-border/30">
                            {score.strengths}
                          </p>
                        </div>
                      )}

                      {score.weaknesses && (
                        <div className="space-y-1">
                          <span className="text-muted-foreground block text-xs font-medium">Điểm cần cải thiện</span>
                          <p className="text-xs text-foreground bg-background p-2.5 rounded-xl border border-border/30">
                            {score.weaknesses}
                          </p>
                        </div>
                      )}

                      {score.feedback && (
                        <div className="space-y-1">
                          <span className="text-muted-foreground block text-xs font-medium">Nhận xét chi tiết</span>
                          <p className="text-xs text-foreground bg-background p-2.5 rounded-xl border border-border/30">
                            {score.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Chưa có đánh giá nào cho buổi phỏng vấn này.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
