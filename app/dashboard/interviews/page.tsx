"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Đã lên lịch", variant: "outline" as const },
  { value: "completed", label: "Hoàn thành", variant: "default" as const },
  { value: "cancelled", label: "Huỷ bỏ", variant: "destructive" as const },
  { value: "rescheduled", label: "Dời lịch", variant: "secondary" as const },
];

export default function InterviewsDashboardPage() {
  const [status, setStatus] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "interviews", status],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (status && status !== "all") sp.append("status", status);
      const res = await fetch(`/api/dashboard/interviews?${sp.toString()}`);
      if (!res.ok) throw new Error("Không thể tải lịch phỏng vấn.");
      const json = await res.json();
      return json.data as any[];
    },
    staleTime: 5000,
  });

  const interviews = data || [];

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

      {/* Filter Options */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1 w-full max-w-[180px]">
              <span className="text-xs font-semibold text-muted-foreground mb-1">Lọc theo trạng thái</span>
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

      {/* Interviews Table/Calendar List */}
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
          <Table>
            <TableHeader className="bg-secondary">
              <TableRow>
                <TableHead>Ứng viên</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Hình thức</TableHead>
                <TableHead>Interviewer</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Đang tải danh sách lịch phỏng vấn...
                  </TableCell>
                </TableRow>
              ) : interviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy lịch phỏng vấn nào.
                  </TableCell>
                </TableRow>
              ) : (
                interviews.map((iv: any) => {
                  const statusConfig =
                    STATUS_OPTIONS.find((s) => s.value === iv.status) || STATUS_OPTIONS[0];
                  return (
                    <TableRow key={iv.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">
                            {iv.applications?.users?.fullName || "—"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Vị trí: {iv.applications?.jobs?.title || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {new Date(iv.scheduled_at).toLocaleDateString("vi-VN")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(iv.scheduled_at).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            ({iv.duration_minutes} phút)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs uppercase font-medium">{iv.type}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium">{iv.users?.fullName || "Admin/HR"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link
                          href={`/dashboard/interviews/${iv.id}`}
                          className="inline-flex h-8 items-center justify-center rounded-2xl border border-input/60 bg-background px-3 text-xs font-medium text-foreground hover:bg-muted hover:text-foreground transition-all"
                        >
                          Chi tiết
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
