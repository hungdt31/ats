"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01FreeIcons } from "@hugeicons/core-free-icons";
import { useMe } from "@/hooks/use-me";
import { useApproveDashboardJob, useDeleteDashboardJob } from "@/hooks/use-dashboard-jobs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const STATUS_OPTIONS = [
  { value: "active", label: "Đang tuyển (Active)", variant: "default" as const },
  { value: "pending", label: "Chờ duyệt (Pending)", variant: "secondary" as const },
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

function JobStatusCell({ job }: { job: Job }) {
  const { data: user } = useMe();
  const approveMutation = useApproveDashboardJob(job.id);
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const status = job.status;

  const getBadge = () => {
    if (status === "pending") {
      return (
        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
          Chờ duyệt (Pending)
        </Badge>
      );
    }
    if (status === "active") {
      return (
        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          Đang tuyển (Active)
        </Badge>
      );
    }
    const cfg = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  return (
    <div className="flex flex-col items-start gap-1.5">
      {status !== "pending" && getBadge()}
      {isAdmin && status === "pending" && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button
              disabled={approveMutation.isPending}
              className="inline-flex h-7 items-center justify-center rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-[10px] font-semibold text-white px-2.5 transition-all cursor-pointer border-none"
            >
              Phê duyệt
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-emerald-600 dark:text-emerald-400">
                Xác nhận phê duyệt
              </DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn phê duyệt tin tuyển dụng <strong className="text-foreground">"{job.title}"</strong>? Tin tuyển dụng này sẽ được hiển thị công khai và ứng viên có thể bắt đầu nộp hồ sơ ứng tuyển.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                disabled={approveMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white border-none"
                size="sm"
                onClick={() => {
                  approveMutation.mutate(undefined, {
                    onSuccess: () => {
                      setIsOpen(false);
                    },
                  });
                }}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? "Đang duyệt..." : "Phê duyệt"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function JobActionCell({ job }: { job: Job }) {
  const { data: user } = useMe();
  const isAdmin = user?.role === "admin";
  const deleteMutation = useDeleteDashboardJob(job.id);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const canDelete = isAdmin || job.status === "draft" || job.status === "pending";

  return (
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
      {canDelete && (
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogTrigger asChild>
            <button
              disabled={deleteMutation.isPending}
              className="inline-flex h-8 items-center justify-center rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 px-3 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-all cursor-pointer disabled:opacity-50"
            >
              Xóa
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600 dark:text-red-400">
                Xác nhận xóa tuyển dụng
              </DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa tin tuyển dụng <strong className="text-foreground">"{job.title}"</strong>? Hành động này không thể hoàn tác và toàn bộ dữ liệu liên quan sẽ bị xóa vĩnh viễn.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteOpen(false)}
                disabled={deleteMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  deleteMutation.mutate(undefined, {
                    onSuccess: () => {
                      setIsDeleteOpen(false);
                    },
                  });
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Đang xóa..." : "Xóa tin"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

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
    cell: ({ row }) => <JobStatusCell job={row.original} />,
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
    cell: ({ row }) => <JobActionCell job={row.original} />,
  },
];

export default function JobsDashboardPage() {
  const { data: user } = useMe();
  const isAdmin = user?.role === "admin";

  const [status, setStatus] = useState<string>("all");
  const [adminTab, setAdminTab] = useState<string>("pending");
  const [adminManagedFilter, setAdminManagedFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "jobs", isAdmin ? "admin-all" : status],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (!isAdmin) {
        if (status && status !== "all") sp.append("status", status);
      }
      const res = await fetch(`/api/dashboard/jobs?${sp.toString()}`);
      if (!res.ok) throw new Error("Không thể tải tin tuyển dụng.");
      const json = await res.json();
      return json.data as Job[];
    },
    staleTime: 5000,
  });

  const jobs = data || [];

  // Phân loại danh sách dành cho Admin
  const adminPendingJobs = jobs.filter((j) => j.status === "pending");
  const adminManagedJobs = jobs.filter((j) => j.status !== "pending" && j.status !== "draft");

  const filteredAdminManagedJobs = adminManagedJobs.filter((j) => {
    if (adminManagedFilter === "all") return true;
    return j.status === adminManagedFilter;
  });

  const filteredStatusOptions = STATUS_OPTIONS.filter(
    (st) => !(user?.role === "admin" && st.value === "draft")
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý tin tuyển dụng</h1>
          <p className="text-sm text-muted-foreground">Theo dõi, chỉnh sửa và đăng tin tuyển dụng mới.</p>
        </div>
        <Link
          href="/dashboard/jobs/new"
          className="inline-flex h-10 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer gap-1.5"
        >
          <HugeiconsIcon icon={Add01FreeIcons} className="size-3.5" /> Đăng tin tuyển dụng
        </Link>
      </div>

      {isAdmin ? (
        <Tabs value={adminTab} onValueChange={setAdminTab} className="w-full">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <TabsList className="w-full sm:w-auto bg-muted p-1 rounded-2xl flex">
              <TabsTrigger value="pending" className="flex-1 sm:flex-initial">
                Cần duyệt ({adminPendingJobs.length})
              </TabsTrigger>
              <TabsTrigger value="managed" className="flex-1 sm:flex-initial">
                Đang quản lý ({adminManagedJobs.length})
              </TabsTrigger>
            </TabsList>

            {adminTab === "managed" && (
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Trạng thái lọc:</span>
                <Select value={adminManagedFilter} onValueChange={setAdminManagedFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Đang tuyển (Active)</SelectItem>
                    <SelectItem value="closed">Đã đóng (Closed)</SelectItem>
                    <SelectItem value="archived">Lưu trữ (Archived)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <TabsContent value="pending" className="mt-0 outline-none">
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">Tuyển dụng cần duyệt</CardTitle>
                  <CardDescription className="text-xs">Các tin tuyển dụng đang chờ phê duyệt.</CardDescription>
                </div>
                <Badge variant="outline" className="font-normal text-xs px-2.5 py-0.5">
                  {isLoading ? "Đang tải..." : `Chờ duyệt: ${adminPendingJobs.length}`}
                </Badge>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center py-8 text-muted-foreground text-sm">Đang tải danh sách tin tuyển dụng...</p>
                ) : (
                  <DataTable
                    columns={columns}
                    data={adminPendingJobs}
                    searchKey="title"
                    searchPlaceholder="Tìm theo tên vị trí tuyển dụng..."
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="managed" className="mt-0 outline-none">
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">Tuyển dụng đang quản lý</CardTitle>
                  <CardDescription className="text-xs">Các tin tuyển dụng đã phê duyệt và lưu trữ.</CardDescription>
                </div>
                <Badge variant="outline" className="font-normal text-xs px-2.5 py-0.5">
                  {isLoading ? "Đang tải..." : `Tổng: ${filteredAdminManagedJobs.length}`}
                </Badge>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center py-8 text-muted-foreground text-sm">Đang tải danh sách tin tuyển dụng...</p>
                ) : (
                  <DataTable
                    columns={columns}
                    data={filteredAdminManagedJobs}
                    searchKey="title"
                    searchPlaceholder="Tìm theo tên vị trí tuyển dụng..."
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <>
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
                      {filteredStatusOptions.map((st) => (
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
        </>
      )}
    </div>
  );
}
