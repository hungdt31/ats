"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "active", label: "Đang tuyển (Active)", variant: "default" as const },
  { value: "draft", label: "Bản nháp (Draft)", variant: "secondary" as const },
  { value: "closed", label: "Đã đóng (Closed)", variant: "outline" as const },
  { value: "archived", label: "Lưu trữ (Archived)", variant: "destructive" as const },
];

type Job = {
  id: string;
  title: string;
  department: string | null;
  status: string;
  expires_at: string | null;
  headcount: number;
  _count?: { applications: number };
};

const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "title",
    header: "Vị trí / Title",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-bold text-foreground">{row.original.title}</span>
        <span className="text-xs text-muted-foreground">
          Đã nộp: {row.original._count?.applications || 0} đơn
        </span>
      </div>
    ),
  },
  {
    accessorKey: "department",
    header: "Bộ phận",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.department || "—"}</span>
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
    accessorKey: "expires_at",
    header: "Hạn ứng tuyển",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.expires_at
          ? new Date(row.original.expires_at).toLocaleDateString("vi-VN")
          : "Không giới hạn"}
      </span>
    ),
  },
  {
    accessorKey: "headcount",
    header: "Headcount",
    cell: ({ row }) => (
      <span className="text-sm font-semibold">{row.original.headcount || 1}</span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="block text-center">Hành động</span>,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <Link
          href={`/dashboard/jobs/${row.original.id}/edit`}
          className="inline-flex h-8 items-center justify-center rounded-2xl border border-input/60 bg-background px-3 text-xs font-medium text-foreground hover:bg-muted transition-all"
        >
          Chỉnh sửa
        </Link>
        <Link
          href={`/dashboard/jobs/${row.original.id}/channels`}
          className="inline-flex h-8 items-center justify-center rounded-2xl border border-input/60 bg-background px-3 text-xs font-medium text-foreground hover:bg-muted transition-all"
        >
          Channels
        </Link>
      </div>
    ),
  },
];

export default function JobsDashboardPage() {
  const [status, setStatus] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "jobs", status],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (status && status !== "all") sp.append("status", status);
      const res = await fetch(`/api/dashboard/jobs?${sp.toString()}`);
      if (!res.ok) throw new Error("Không thể tải tin tuyển dụng.");
      const json = await res.json();
      return json.data as Job[];
    },
    staleTime: 5000,
  });

  const jobs = data || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý tin tuyển dụng</h1>
          <p className="text-sm text-muted-foreground">Theo dõi, chỉnh sửa và đăng tin tuyển dụng mới.</p>
        </div>
        <Link
          href="/dashboard/jobs/new"
          className="inline-flex h-10 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
        >
          + Đăng tin tuyển dụng
        </Link>
      </div>

      {/* Status Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1 w-full max-w-[200px]">
              <span className="text-xs font-semibold text-muted-foreground mb-1">Trạng thái tin</span>
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
            <CardTitle className="text-lg font-semibold">Danh sách tin tuyển dụng</CardTitle>
            <CardDescription className="text-xs">Theo thứ tự thời gian tạo mới nhất.</CardDescription>
          </div>
          <Badge variant="outline" className="font-normal text-xs px-2.5 py-0.5">
            {isLoading ? "Đang tải..." : `Tổng: ${jobs.length}`}
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground text-sm">Đang tải danh sách tin tuyển dụng...</p>
          ) : (
            <DataTable
              columns={columns}
              data={jobs}
              searchKey="title"
              searchPlaceholder="Tìm theo tên vị trí tuyển dụng..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
