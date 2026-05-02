"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
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

export default function ApplicationsDashboardPage() {
  const [jobId, setJobId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [source, setSource] = useState<string>("all");

  const queryKey = ["dashboard", "applications", jobId, status, source];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (jobId && jobId !== "all") sp.append("jobId", jobId);
      if (status && status !== "all") sp.append("status", status);
      if (source && source !== "all") sp.append("source", source);

      const res = await fetch(`/api/dashboard/applications?${sp.toString()}`);
      if (!res.ok) throw new Error("Không thể tải đơn ứng tuyển.");
      const json = await res.json();
      return json.data as {
        applications: any[];
        jobs: any[];
      };
    },
    staleTime: 5000,
  });

  const applications = data?.applications || [];
  const jobs = data?.jobs || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý đơn ứng tuyển</h1>
          <p className="text-sm text-muted-foreground">Theo dõi, lọc và xem chi tiết hồ sơ ứng viên.</p>
        </div>
      </div>

      {/* Filter Toolbar with shadcn Selects */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1 w-full max-w-xs">
              <span className="text-xs font-semibold text-muted-foreground mb-1 select-none">Lọc theo việc làm</span>
              <Select value={jobId} onValueChange={(val) => setJobId(val)}>
                <SelectTrigger className="w-full h-10 rounded-2xl border border-input/60">
                  <SelectValue placeholder="Tất cả việc làm" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">Tất cả việc làm</SelectItem>
                  {jobs.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 w-full max-w-[180px]">
              <span className="text-xs font-semibold text-muted-foreground mb-1 select-none">Lọc theo trạng thái</span>
              <Select value={status} onValueChange={(val) => setStatus(val)}>
                <SelectTrigger className="w-full h-10 rounded-2xl border border-input/60">
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

            <div className="flex flex-col gap-1 w-full max-w-[180px]">
              <span className="text-xs font-semibold text-muted-foreground mb-1 select-none">Lọc theo nguồn</span>
              <Select value={source} onValueChange={(val) => setSource(val)}>
                <SelectTrigger className="w-full h-10 rounded-2xl border border-input/60">
                  <SelectValue placeholder="Tất cả nguồn" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">Tất cả nguồn</SelectItem>
                  {SOURCE_OPTIONS.map((src) => (
                    <SelectItem key={src.value} value={src.value}>
                      {src.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              {(jobId !== "all" || status !== "all" || source !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setJobId("all");
                    setStatus("all");
                    setSource("all");
                  }}
                  className="flex h-10 items-center justify-center rounded-2xl border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Xoá lọc
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications list using shadcn Table */}
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
          <Table>
            <TableHeader className="bg-secondary">
              <TableRow>
                <TableHead>Ứng viên</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Nguồn</TableHead>
                <TableHead>Ngày gửi</TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Đang tải danh sách đơn ứng tuyển...
                  </TableCell>
                </TableRow>
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy đơn ứng tuyển nào.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app: any) => {
                  const statusConfig =
                    STATUS_OPTIONS.find((s) => s.value === app.status) || STATUS_OPTIONS[0];
                  const sourceLabel =
                    SOURCE_OPTIONS.find((s) => s.value === app.source_channel)?.label ||
                    app.source_channel ||
                    "—";
                  return (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{app.users?.fullName || "—"}</span>
                          <span className="text-xs text-muted-foreground">{app.users?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground">{app.jobs?.title}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{sourceLabel}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {new Date(app.applied_at).toLocaleDateString("vi-VN")}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link
                          href={`/dashboard/applications/${app.id}`}
                          className="inline-flex h-8 items-center justify-center rounded-2xl border border-input/60 bg-background px-3 text-xs font-medium text-foreground hover:bg-muted hover:text-foreground transition-all"
                        >
                          Xem chi tiết
                        </Link>
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
