"use client";

import { useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { type DashboardInterviewListItem, useDashboardInterviews } from "@/hooks/use-dashboard-interviews";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Đã lên lịch", variant: "outline" as const },
  { value: "completed", label: "Hoàn thành", variant: "default" as const },
  { value: "cancelled", label: "Huỷ bỏ", variant: "destructive" as const },
  { value: "rescheduled", label: "Dời lịch", variant: "secondary" as const },
];

const columns: ColumnDef<DashboardInterviewListItem>[] = [
  {
    id: "candidate",
    accessorFn: (row) =>
      `${row.applications?.users?.fullName ?? ""} ${row.applications?.jobs?.title ?? ""}`,
    header: "Ứng viên",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">
          {row.original.applications?.users?.fullName || "—"}
        </span>
        <span className="text-xs text-muted-foreground">
          Vị trí: {row.original.applications?.jobs?.title || "—"}
        </span>
      </div>
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "scheduled_at",
    header: "Thời gian",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">
          {new Date(row.original.scheduled_at).toLocaleDateString("vi-VN")}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.scheduled_at).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          ({row.original.duration_minutes} phút)
        </span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Hình thức",
    cell: ({ row }) => (
      <span className="text-xs uppercase font-medium">{row.original.type}</span>
    ),
  },
  {
    id: "interviewer",
    accessorFn: (row) => row.users?.fullName ?? "",
    header: "Interviewer",
    cell: ({ row }) => (
      <span className="text-xs font-medium">{row.original.users?.fullName || "Admin/HR"}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const cfg = STATUS_OPTIONS.find((s) => s.value === row.original.status) || STATUS_OPTIONS[0];
      return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
    },
  },
  {
    id: "actions",
    header: () => <span className="block text-center">Hành động</span>,
    cell: ({ row }) => (
      <div className="text-center">
        <Link
          href={`/dashboard/interviews/${row.original.id}`}
          className="inline-flex h-8 items-center justify-center rounded-2xl border border-input/60 bg-background px-3 text-xs font-medium text-foreground hover:bg-muted transition-all"
        >
          Chi tiết
        </Link>
      </div>
    ),
  },
];

export default function InterviewsDashboardPage() {
  const [status, setStatus] = useState<string>("all");

  const { data, isLoading } = useDashboardInterviews(status);
  const interviews = data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lịch phỏng vấn</h1>
          <p className="text-sm text-muted-foreground">Xem, lọc và tạo các buổi phỏng vấn theo lịch trình.</p>
        </div>
        <Link
          href="/dashboard/interviews/new"
          className="inline-flex h-10 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
        >
          + Lên lịch phỏng vấn
        </Link>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1 w-full max-w-[180px]">
              <span className="text-xs font-semibold text-muted-foreground mb-1">Lọc theo trạng thái</span>
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
            {status !== "all" && (
              <button
                type="button"
                onClick={() => setStatus("all")}
                className="flex h-10 items-center justify-center rounded-2xl border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Xoá lọc
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">Các buổi phỏng vấn</CardTitle>
            <CardDescription className="text-xs">Theo thứ tự thời gian tăng dần.</CardDescription>
          </div>
          <Badge variant="outline" className="font-normal text-xs px-2.5 py-0.5">
            {isLoading ? "Đang tải..." : `Tổng: ${interviews.length}`}
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground text-sm">Đang tải danh sách lịch phỏng vấn...</p>
          ) : (
            <DataTable
              columns={columns}
              data={interviews}
              searchKey="candidate"
              searchPlaceholder="Tìm theo tên ứng viên hoặc vị trí..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
