"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
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

type EmailLog = {
  id: string;
  subject: string;
  type: string;
  status: string;
  sent_at: string | null;
  created_at: string;
  error_message: string | null;
  users_email_logs_recipient_idTousers?: { fullName: string; email: string };
  applications?: { id: string };
};

const columns: ColumnDef<EmailLog>[] = [
  {
    id: "recipient",
    accessorFn: (row) =>
      `${row.users_email_logs_recipient_idTousers?.fullName ?? ""} ${row.users_email_logs_recipient_idTousers?.email ?? ""}`,
    header: "Người nhận",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">
          {row.original.users_email_logs_recipient_idTousers?.fullName || "—"}
        </span>
        <span className="text-xs text-muted-foreground">
          {row.original.users_email_logs_recipient_idTousers?.email}
        </span>
      </div>
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "subject",
    header: "Tiêu đề (Subject)",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.subject}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Loại",
    cell: ({ row }) => {
      const typeLabel = TYPE_OPTIONS.find((t) => t.value === row.original.type)?.label || row.original.type;
      return <span className="text-xs font-medium uppercase">{typeLabel}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const cfg = STATUS_OPTIONS.find((s) => s.value === row.original.status) || STATUS_OPTIONS[0];
      return (
        <div>
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
          {row.original.error_message && (
            <p className="text-xs text-destructive mt-1 max-w-xs break-words">
              Lỗi: {row.original.error_message}
            </p>
          )}
        </div>
      );
    },
  },
  {
    id: "time",
    accessorFn: (row) => row.sent_at ?? row.created_at,
    header: "Thời gian",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {new Date(row.original.sent_at ?? row.original.created_at).toLocaleString("vi-VN")}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Hành động",
    cell: ({ row }) =>
      row.original.applications?.id ? (
        <Link
          href={`/dashboard/applications/${row.original.applications.id}`}
          className="inline-flex h-8 items-center justify-center rounded-2xl border border-input/60 bg-background px-3 text-xs font-medium text-foreground hover:bg-muted transition-all"
        >
          Xem hồ sơ
        </Link>
      ) : null,
  },
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
      return json.data as EmailLog[];
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
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tất cả loại email" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">Tất cả loại email</SelectItem>
                  {TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 w-full max-w-[180px]">
              <span className="text-xs font-semibold text-muted-foreground mb-1">Trạng thái</span>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {STATUS_OPTIONS.map((st) => (
                    <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(type !== "all" || status !== "all") && (
              <button
                type="button"
                onClick={() => { setType("all"); setStatus("all"); }}
                className="flex h-10 items-center justify-center rounded-2xl border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Xoá lọc
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
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
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground text-sm">Đang tải nhật ký email...</p>
          ) : (
            <DataTable
              columns={columns}
              data={emailLogs}
              searchKey="recipient"
              searchPlaceholder="Tìm theo tên hoặc email người nhận..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
