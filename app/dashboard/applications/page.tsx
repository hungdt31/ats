"use client";

import { useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { useDashboardApplications } from "@/hooks/use-dashboard-applications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "applied", label: "Đã ứng tuyển", variant: "outline" as const },
  { value: "screening", label: "Sàng lọc", variant: "secondary" as const },
  { value: "interviewing", label: "Phỏng vấn", variant: "default" as const },
  { value: "offered", label: "Đã gửi offer", variant: "default" as const },
  { value: "hired", label: "Đã tuyển", variant: "default" as const },
  { value: "rejected", label: "Từ chối", variant: "destructive" as const },
];

const SOURCE_OPTIONS = [
  { value: "website", label: "Website" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "itviec", label: "ITViec" },
  { value: "topcv", label: "TopCV" },
  { value: "vietnamworks", label: "VietnamWorks" },
];

type Application = {
  id: string;
  status: string;
  source_channel: string | null;
  applied_at: string;
  users?: { fullName: string; email: string };
  jobs?: { title: string };
};

const columns: ColumnDef<Application>[] = [
  {
    id: "candidate",
    accessorFn: (row) => `${row.users?.fullName ?? ""} ${row.users?.email ?? ""}`,
    header: "Ứng viên",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{row.original.users?.fullName || "—"}</span>
        <span className="text-xs text-muted-foreground">{row.original.users?.email}</span>
      </div>
    ),
    filterFn: "includesString",
  },
  {
    id: "job",
    accessorFn: (row) => row.jobs?.title ?? "",
    header: "Vị trí",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.jobs?.title}</span>
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
    accessorKey: "source_channel",
    header: "Nguồn",
    cell: ({ row }) => {
      const label =
        SOURCE_OPTIONS.find((s) => s.value === row.original.source_channel)?.label ||
        row.original.source_channel ||
        "—";
      return <span className="text-xs text-muted-foreground">{label}</span>;
    },
  },
  {
    accessorKey: "applied_at",
    header: "Ngày gửi",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {new Date(row.original.applied_at).toLocaleDateString("vi-VN")}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="block text-center">Hành động</span>,
    cell: ({ row }) => (
      <div className="text-center">
        <Link
          href={`/dashboard/applications/${row.original.id}`}
          className="inline-flex h-8 items-center justify-center rounded-2xl border border-input/60 bg-background px-3 text-xs font-medium text-foreground hover:bg-muted transition-all"
        >
          Xem chi tiết
        </Link>
      </div>
    ),
  },
];

export default function ApplicationsDashboardPage() {
  const [jobId, setJobId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [source, setSource] = useState<string>("all");

  const { data, isLoading } = useDashboardApplications({ jobId, status, source });

  const applications = (data?.applications as Application[]) || [];
  const jobs = (data?.jobs as { id: string; title: string }[]) || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý đơn ứng tuyển</h1>
          <p className="text-sm text-muted-foreground">Theo dõi, lọc và xem chi tiết hồ sơ ứng viên.</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1 w-full max-w-xs">
              <span className="text-xs font-semibold text-muted-foreground mb-1 select-none">Lọc theo việc làm</span>
              <Select value={jobId} onValueChange={setJobId}>
                <SelectTrigger className="w-full h-10 rounded-2xl border border-input/60">
                  <SelectValue placeholder="Tất cả việc làm" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">Tất cả việc làm</SelectItem>
                  {jobs.map((j) => (
                    <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 w-full max-w-[180px]">
              <span className="text-xs font-semibold text-muted-foreground mb-1 select-none">Lọc theo trạng thái</span>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full h-10 rounded-2xl border border-input/60">
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

            <div className="flex flex-col gap-1 w-full max-w-[180px]">
              <span className="text-xs font-semibold text-muted-foreground mb-1 select-none">Lọc theo nguồn</span>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="w-full h-10 rounded-2xl border border-input/60">
                  <SelectValue placeholder="Tất cả nguồn" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">Tất cả nguồn</SelectItem>
                  {SOURCE_OPTIONS.map((src) => (
                    <SelectItem key={src.value} value={src.value}>{src.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(jobId !== "all" || status !== "all" || source !== "all") && (
              <button
                type="button"
                onClick={() => { setJobId("all"); setStatus("all"); setSource("all"); }}
                className="flex h-10 items-center justify-center rounded-2xl border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
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
            <CardTitle className="text-lg font-semibold">Danh sách đơn ứng tuyển</CardTitle>
          </div>
          <Badge variant="outline" className="font-normal text-xs px-2.5 py-0.5">
            {isLoading ? "Đang tải..." : `Tổng: ${applications.length} đơn`}
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground text-sm">Đang tải danh sách đơn ứng tuyển...</p>
          ) : (
            <DataTable
              columns={columns}
              data={applications}
              searchKey="candidate"
              searchPlaceholder="Tìm theo tên hoặc email ứng viên..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
