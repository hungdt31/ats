import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Briefcase01Icon, Calendar01Icon, File01Icon } from "@hugeicons/core-free-icons";

import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { DashboardCharts } from "./dashboard-charts";

export default async function DashboardPage() {
  const session = await getSession();
  const name = session?.user?.fullName ?? "Thành viên";

  // Fetch KPI data
  const [
    activeJobsCount,
    newApplicationsCount,
    scheduledInterviewsCount,
    totalApplicationsCount,
    hiredApplicationsCount,
    interviewingApplicationsCount,
    draftJobsCount,
    adminCount,
    hrCount,
    interviewerCount,
    candidateCount,
  ] = await Promise.all([
    prisma.jobs.count({ where: { status: "active" } }),
    prisma.applications.count({ where: { status: "applied" } }),
    prisma.interviews.count({ where: { status: "scheduled" } }),
    prisma.applications.count(),
    prisma.applications.count({ where: { status: "hired" } }),
    prisma.applications.count({ where: { status: "interviewing" } }),
    prisma.jobs.count({ where: { status: "draft" } }),
    prisma.user.count({ where: { role: "admin" } }),
    prisma.user.count({ where: { role: "hr" } }),
    prisma.user.count({ where: { role: "interviewer" } }),
    prisma.user.count({ where: { role: "candidate" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
        <p className="text-sm text-muted-foreground">Chào mừng quay trở lại, {name}!</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/80 bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-muted-foreground">Tin tuyển dụng hoạt động</CardDescription>
            <CardTitle className="text-3xl font-bold">{activeJobsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline"
            >
              <HugeiconsIcon icon={Briefcase01Icon} strokeWidth={2} className="size-3.5 shrink-0" />
              Quản lý tin tuyển dụng
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5 shrink-0" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-muted-foreground">Đơn ứng tuyển mới</CardDescription>
            <CardTitle className="text-3xl font-bold">{newApplicationsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/applications"
              className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline"
            >
              <HugeiconsIcon icon={File01Icon} strokeWidth={2} className="size-3.5 shrink-0" />
              Xem đơn ứng tuyển
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5 shrink-0" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-muted-foreground">Phỏng vấn đã lên lịch</CardDescription>
            <CardTitle className="text-3xl font-bold">{scheduledInterviewsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/interviews"
              className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline"
            >
              <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} className="size-3.5 shrink-0" />
              Xem lịch phỏng vấn
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5 shrink-0" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Visual Chart & Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardCharts
          activeJobsCount={activeJobsCount}
          newApplicationsCount={newApplicationsCount}
          scheduledInterviewsCount={scheduledInterviewsCount}
        />

        {/* User statistics section */}
        <Card className="border-border/80 bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Thống kê người dùng</CardTitle>
            <CardDescription className="text-xs">
              Tổng quan số lượng tài khoản theo từng vai trò trên hệ thống.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-border/50 bg-muted/30 rounded-2xl flex flex-col justify-between h-[100px]">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quản trị viên (Admin)</span>
                <span className="text-2xl font-bold text-foreground">{adminCount}</span>
              </div>
              <div className="p-3 border border-border/50 bg-muted/30 rounded-2xl flex flex-col justify-between h-[100px]">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tuyển dụng (HR)</span>
                <span className="text-2xl font-bold text-foreground">{hrCount}</span>
              </div>
              <div className="p-3 border border-border/50 bg-muted/30 rounded-2xl flex flex-col justify-between h-[100px]">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phỏng vấn viên</span>
                <span className="text-2xl font-bold text-foreground">{interviewerCount}</span>
              </div>
              <div className="p-3 border border-border/50 bg-muted/30 rounded-2xl flex flex-col justify-between h-[100px]">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ứng viên</span>
                <span className="text-2xl font-bold text-foreground">{candidateCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
