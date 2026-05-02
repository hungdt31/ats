"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "active", label: "Đang tuyển (Active)", variant: "default" as const },
  { value: "draft", label: "Bản nháp (Draft)", variant: "secondary" as const },
  { value: "closed", label: "Đã đóng (Closed)", variant: "outline" as const },
  { value: "archived", label: "Lưu trữ (Archived)", variant: "destructive" as const },
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
      return json.data as any[];
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

      {/* Status Filter Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1 w-full max-w-[200px]">
              <span className="text-xs font-semibold text-muted-foreground mb-1">Trạng thái tin</span>
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

      {/* Jobs List Table */}
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
          <Table>
            <TableHeader className="bg-secondary">
              <TableRow>
                <TableHead>Vị trí / Title</TableHead>
                <TableHead>Bộ phận</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hạn ứng tuyển</TableHead>
                <TableHead>Headcount</TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Đang tải danh sách tin tuyển dụng...
                  </TableCell>
                </TableRow>
              ) : jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy tin tuyển dụng nào.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job: any) => {
                  const statusConfig =
                    STATUS_OPTIONS.find((s) => s.value === job.status) || STATUS_OPTIONS[0];
                  return (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{job.title}</span>
                          <span className="text-xs text-muted-foreground">
                            Đã nộp: {job._count?.applications || 0} đơn
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{job.department || "—"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {job.expires_at
                            ? new Date(job.expires_at).toLocaleDateString("vi-VN")
                            : "Không giới hạn"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold">{job.headcount || 1}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/dashboard/jobs/${job.id}/edit`}
                            className="inline-flex h-8 items-center justify-center rounded-2xl border border-input/60 bg-background px-3 text-xs font-medium text-foreground hover:bg-muted transition-all"
                          >
                            Chỉnh sửa
                          </Link>
                          <Link
                            href={`/dashboard/jobs/${job.id}/channels`}
                            className="inline-flex h-8 items-center justify-center rounded-2xl border border-input/60 bg-background px-3 text-xs font-medium text-foreground hover:bg-muted transition-all"
                          >
                            Channels
                          </Link>
                        </div>
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
