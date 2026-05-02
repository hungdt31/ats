"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Props = {
  interviews: any[] | undefined;
  isLoading: boolean;
};

const mapInterviewStatus = (status: string) => {
  switch (status) {
    case "scheduled":
      return { label: "Đã lên lịch", variant: "default" as const };
    case "completed":
      return { label: "Đã hoàn thành", variant: "secondary" as const };
    case "cancelled":
      return { label: "Đã hủy", variant: "destructive" as const };
    default:
      return { label: "—", variant: "outline" as const };
  }
};

const mapInterviewType = (type: string) => {
  switch (type) {
    case "video":
      return "Trực tuyến (Video)";
    case "phone":
      return "Gọi điện thoại";
    case "onsite":
      return "Trực tiếp (Onsite)";
    default:
      return type;
  }
};

export function CandidateInterviews({ interviews, isLoading }: Props) {
  if (isLoading) {
    return <p className="text-muted-foreground py-6 animate-pulse">Đang tải lịch phỏng vấn...</p>;
  }

  if (!interviews || interviews.length === 0) {
    return (
      <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-muted-foreground">
        Bạn hiện chưa có lịch phỏng vấn nào.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {interviews.map((iv) => {
        const statusInfo = mapInterviewStatus(iv.status);
        const scheduledTime = new Date(iv.scheduled_at).toLocaleString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <Card key={iv.id} className="border-border/80 transition-shadow hover:shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-lg font-semibold leading-none hover:underline">
                  Phỏng vấn vị trí:{" "}
                  <Link href={`/jobs/${iv.applications?.jobs?.id}`}>
                    {iv.applications?.jobs?.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-primary font-medium">
                  {scheduledTime}
                </CardDescription>
              </div>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </CardHeader>
            <Separator />
            <CardContent className="text-muted-foreground space-y-3 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground block text-xs">Hình thức phỏng vấn</span>
                  <span className="font-medium text-foreground">{mapInterviewType(iv.type)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Thời lượng dự kiến</span>
                  <span className="font-medium text-foreground">{iv.duration_minutes} phút</span>
                </div>
              </div>

              {iv.meeting_link && (
                <div className="pt-2">
                  <span className="text-muted-foreground block text-xs mb-0.5">Link tham gia</span>
                  <a
                    href={iv.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline break-all"
                  >
                    {iv.meeting_link}
                  </a>
                </div>
              )}

              {iv.location && (
                <div className="pt-2">
                  <span className="text-muted-foreground block text-xs">Địa điểm</span>
                  <span className="font-medium text-foreground">{iv.location}</span>
                </div>
              )}

              {iv.notes && (
                <div className="pt-2">
                  <span className="text-muted-foreground block text-xs mb-0.5">Ghi chú từ HR</span>
                  <p className="text-foreground bg-muted/40 p-3 rounded-xl border border-border/30 whitespace-pre-wrap leading-relaxed">
                    {iv.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
