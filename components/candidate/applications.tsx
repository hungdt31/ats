"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ApplicationResponseItem } from "@/hooks/use-candidate";

type Props = {
  applications: ApplicationResponseItem[] | undefined;
  isLoading: boolean;
};

const mapAppStatus = (status: string) => {
  switch (status) {
    case "screening":
      return { label: "Sàng lọc", variant: "secondary" as const };
    case "interviewing":
      return { label: "Phỏng vấn", variant: "default" as const };
    case "offered":
      return { label: "Đã gửi offer", variant: "default" as const };
    case "hired":
      return { label: "Đã tuyển", variant: "default" as const };
    case "rejected":
      return { label: "Từ chối", variant: "destructive" as const };
    default:
      return { label: "Đã ứng tuyển", variant: "outline" as const };
  }
};

export function CandidateApplications({ applications, isLoading }: Props) {
  if (isLoading) {
    return <p className="text-muted-foreground py-6 animate-pulse">Đang tải danh sách đơn ứng tuyển...</p>;
  }

  if (!applications || applications.length === 0) {
    return (
      <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-muted-foreground">
        Bạn chưa gửi đơn ứng tuyển nào.{" "}
        <Link href="/jobs" className="text-primary underline">
          Xem danh sách việc làm
        </Link>
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {applications.map((app) => {
        const statusInfo = mapAppStatus(app.status);
        return (
          <Card key={app.id} className="border-border/80 transition-shadow hover:shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-lg font-semibold leading-none hover:underline">
                  {app.jobs?.slug ? (
                    <Link href={`/jobs/${app.jobs.slug}`}>{app.jobs.title}</Link>
                  ) : (
                    <span>{app.jobs?.title ?? "—"}</span>
                  )}
                </CardTitle>
                <CardDescription>
                  Ứng tuyển ngày {new Date(app.applied_at).toLocaleDateString("vi-VN")}
                </CardDescription>
              </div>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </CardHeader>
            <Separator />
            <CardContent className="text-sm text-muted-foreground space-y-2">
              {app.cv_file_url && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="font-medium text-foreground">Link CV:</span>
                  <a
                    href={app.cv_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {app.cv_filename || app.cv_file_url}
                  </a>
                </div>
              )}
              {app.cover_letter && (
                <div className="pt-2">
                  <span className="font-medium text-foreground block mb-1">Thư giới thiệu:</span>
                  <p className="text-foreground bg-muted/40 p-3 rounded-xl border border-border/30 whitespace-pre-wrap leading-relaxed">
                    {app.cover_letter}
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
