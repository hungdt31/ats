"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import Link from "next/link";

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

export default function EmailsDashboardPage() {
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "emails", type, status],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (type && type !== "all") sp.append("type", type);
      if (status && status !== "all") sp.append("status", status);
      const res = await fetch(`/api/dashboard/emails?${sp.toString()}`);
      if (!res.ok) throw new Error("Không thể tải nhật ký email.");
      const json = await res.json();
      return json.data as any[];
    },
    staleTime: 5000,
  });

  const emailLogs = data || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Email</h1>
          <p className="text-sm text-muted-foreground">Theo dõi và kiểm tra lịch sử tất cả các email đã gửi từ hệ thống.</p>
        </div>
      </div>

      {/* Filter Options */}
      <Card className="border-border/80">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1 w-full max-w-[220px]">
              <span className="text-xs font-semibold text-muted-foreground mb-1">Loại email</span>
              <Select value={type} onValueChange={(val) => setType(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tất cả loại email" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">Tất cả loại email</SelectItem>
                  {TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 w-full max-w-[180px]">
              <span className="text-xs font-semibold text-muted-foreground mb-1">Trạng thái</span>
              <Select value={status} onValueChange={(val) => setStatus(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {STATUS_OPTIONS.map((st) => (
                    <SelectItem key={st.value} value={st.value}>
                      {st.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(type !== "all" || status !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setType("all");
                  setStatus("all");
                }}
                className="flex h-10 items-center justify-center rounded-2xl border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Xoá lọc
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emails Table */}
      <Card className="border-border/80 bg-card">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">Nhật ký email</CardTitle>
            <CardDescription className="text-xs">
              Xem chi tiết nội dung, người nhận và trạng thái gửi.
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-normal text-xs px-2.5 py-0.5">
            {isLoading ? "Đang tải..." : `Tổng: ${emailLogs.length}`}
          </Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-secondary">
              <TableRow>
                <TableHead>Người nhận</TableHead>
                <TableHead>Tiêu đề (Subject)</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Đang tải nhật ký email...
                  </TableCell>
                </TableRow>
              ) : emailLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">
                            {log.users_email_logs_recipient_idTousers?.fullName || "—"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {log.users_email_logs_recipient_idTousers?.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground">{log.subject}</span>
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
                      <TableCell>
                        {log.applications?.id && (
                          <Link
                            href={`/dashboard/applications/${log.applications.id}`}
                            className="inline-flex h-8 items-center justify-center rounded-2xl border border-input/60 bg-background px-3 text-xs font-medium text-foreground hover:bg-muted transition-all"
                          >
                            Xem hồ sơ
                          </Link>
                        )}
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
