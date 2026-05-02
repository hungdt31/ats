"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

const TYPE_OPTIONS = [
  { value: "invite", label: "Mời phỏng vấn" },
  { value: "result", label: "Thông báo kết quả" },
  { value: "reminder", label: "Nhắc nhở" },
  { value: "rejection", label: "Thư từ chối" },
  { value: "offer", label: "Thư mời nhận việc (Offer)" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ gửi", variant: "secondary" as const },
  { value: "sent", label: "Đã gửi", variant: "default" as const },
  { value: "failed", label: "Thất bại", variant: "destructive" as const },
];

type Params = Promise<{ id: string }>;

export default function ApplicationEmailsPage(props: { params: Params }) {
  const params = React.use(props.params);
  const applicationId = params.id;

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "applications", applicationId, "emails"],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/applications/${applicationId}/emails`);
      if (!res.ok) throw new Error("Không thể tải thông tin.");
      const json = await res.json();
      return json.data as {
        emailLogs: any[];
        application: any;
      };
    },
  });

  const emailLogs = data?.emailLogs || [];
  const application = data?.application || {};

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/applications/${applicationId}`}
            className="inline-flex h-9 items-center justify-center rounded-2xl border border-input/60 bg-background px-4 text-xs font-medium text-foreground hover:bg-muted transition-all"
          >
            ← Quay lại hồ sơ 360°
          </Link>
        </div>
      </div>

      <Card className="border-border/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Nhật ký email đơn ứng tuyển</CardTitle>
            <CardDescription className="text-sm">
              Ứng viên: <strong>{application?.users?.fullName || "—"}</strong> · Vị trí: <strong>{application?.jobs?.title || "—"}</strong>
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-normal text-xs px-2.5 py-0.5">
            {isLoading ? "Đang tải..." : `Tổng: ${emailLogs.length}`}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary">
              <TableRow>
                <TableHead>Tiêu đề (Subject)</TableHead>
                <TableHead>Loại email</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Đang tải nhật ký email...
                  </TableCell>
                </TableRow>
              ) : emailLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy email nào.
                  </TableCell>
                </TableRow>
              ) : (
                emailLogs.map((log: any) => {
                  const statusConfig =
                    STATUS_OPTIONS.find((s) => s.value === log.status) || STATUS_OPTIONS[0];
                  const typeLabel = TYPE_OPTIONS.find((t) => t.value === log.type)?.label || log.type;

                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <span className="font-medium text-foreground block">{log.subject}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium uppercase">{typeLabel}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                        {log.error_message && (
                          <p className="text-xs text-destructive mt-1 max-w-xs break-words">
                            Lỗi: {log.error_message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {log.sent_at
                            ? new Date(log.sent_at).toLocaleString("vi-VN")
                            : new Date(log.created_at).toLocaleString("vi-VN")}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
