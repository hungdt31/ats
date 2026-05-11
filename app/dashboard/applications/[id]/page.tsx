import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusUpdateDialog } from "./status-update-dialog";
import { SendEmailForm } from "./send-email-form";
import { CreateInterviewForm } from "./create-interview-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, Calendar01Icon, CheckmarkCircle01Icon, Notification01Icon, CancelCircleIcon } from "@hugeicons/core-free-icons";

const STATUS_OPTIONS = [
  { value: "applied", label: "Đã ứng tuyển", variant: "outline" as const },
  { value: "screening", label: "Sàng lọc", variant: "secondary" as const },
  { value: "interviewing", label: "Phỏng vấn", variant: "default" as const },
  { value: "offered", label: "Đã gửi offer", variant: "default" as const },
  { value: "hired", label: "Đã tuyển", variant: "default" as const },
  { value: "rejected", label: "Từ chối", variant: "destructive" as const },
];

type Params = Promise<{ id: string }>;

export default async function ApplicationDetailPage(props: {
  params: Params;
}) {
  const params = await props.params;
  const appId = params.id;

  // Fetch full 360° application profile
  const application = await prisma.applications.findUnique({
    where: { id: appId },
    include: {
      users: true,
      jobs: true,
      application_status_history: {
        include: {
          users: {
            select: { fullName: true, email: true },
          },
        },
        orderBy: { changed_at: "desc" },
      },
      interviews: {
        include: {
          users: {
            select: { fullName: true, email: true },
          },
          interview_scores: {
            include: {
              users: {
                select: { fullName: true, email: true },
              },
            },
          },
        },
        orderBy: { scheduled_at: "desc" },
      },
      email_logs: {
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!application) {
    notFound();
  }

  const interviewers = await prisma.user.findMany({
    where: {
      role: { in: ["admin", "hr", "interviewer"] }
    },
    select: {
      id: true,
      fullName: true,
      email: true
    }
  });

  const currentStatusConfig = STATUS_OPTIONS.find((s) => s.value === application.status) || STATUS_OPTIONS[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hồ sơ ứng viên</h1>
          <p className="text-sm text-muted-foreground">
            Toàn bộ thông tin, lịch sử và phỏng vấn của đơn ứng tuyển.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/applications"
            className="inline-flex h-9 items-center justify-center rounded-2xl border border-input/60 bg-background px-4 text-xs font-medium text-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Candidate info summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Ứng viên</CardTitle>
                <Badge variant={currentStatusConfig.variant}>{currentStatusConfig.label}</Badge>
              </div>
              <CardDescription className="text-sm font-medium text-primary">
                Vị trí: {application.jobs?.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground block text-xs">Họ và tên</span>
                <span className="font-semibold text-foreground">{application.users?.fullName || "—"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block text-xs">Email</span>
                <span className="font-medium text-foreground">{application.users?.email || "—"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block text-xs">Ngày gửi đơn</span>
                <span className="font-medium text-foreground">
                  {new Date(application.applied_at).toLocaleString("vi-VN")}
                </span>
              </div>

              <Separator />

              <div className="space-y-1">
                <span className="text-muted-foreground block text-xs font-medium">Link CV:</span>
                <a
                  href={application.cv_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all block"
                >
                  {application.cv_filename || application.cv_file_url}
                </a>
              </div>
              {application.cover_letter && (
                <div className="space-y-1">
                  <span className="text-muted-foreground block text-xs font-medium">Thư giới thiệu:</span>
                  <p className="text-xs text-foreground bg-muted/40 p-3 rounded-xl border border-border/30 whitespace-pre-wrap leading-relaxed">
                    {application.cover_letter}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="audit-history" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="audit-history">Lịch sử ({application.application_status_history.length})</TabsTrigger>
              <TabsTrigger value="interviews">Phỏng vấn ({application.interviews.length})</TabsTrigger>
              <TabsTrigger value="emails">Nhật ký email ({application.email_logs.length})</TabsTrigger>
            </TabsList>

            {/* Tab 1: Lịch sử trạng thái */}
            <TabsContent value="audit-history" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div>
                      <CardTitle className="text-lg">Lịch sử thay đổi trạng thái</CardTitle>
                      <CardDescription>Nhật ký chi tiết các lần cập nhật đơn ứng tuyển.</CardDescription>
                    </div>
                    <StatusUpdateDialog
                      applicationId={application.id}
                      currentStatus={application.status}
                      statusOptions={STATUS_OPTIONS}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {application.application_status_history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Chưa có thay đổi nào.</p>
                  ) : (
                    <div className="relative pl-6 border-l border-border/60 ml-3 space-y-6">
                      {application.application_status_history.map((history) => {
                        const fromLabel = STATUS_OPTIONS.find((o) => o.value === history.from_status)?.label || history.from_status || "—";
                        const toLabel = STATUS_OPTIONS.find((o) => o.value === history.to_status)?.label || history.to_status;
                        return (
                          <div key={history.id} className="relative space-y-1">
                            <span className="absolute -left-[28px] top-1.5 flex size-2 items-center justify-center rounded-full bg-primary" />
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                              <span className="text-sm font-semibold text-foreground">
                                Chuyển từ <Badge variant="outline" className="px-1.5 py-0.5">{fromLabel}</Badge> sang{" "}
                                <Badge variant="default" className="px-1.5 py-0.5">{toLabel}</Badge>
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(history.changed_at).toLocaleString("vi-VN")}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Bởi người dùng: {history.users?.fullName || history.users?.email || "Admin/HR"}
                            </p>
                            {history.note && (
                              <p className="text-xs text-foreground bg-muted/40 p-3 rounded-xl border border-border/30 whitespace-pre-wrap leading-relaxed">
                                {history.note}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Phỏng vấn & Đánh giá */}
            <TabsContent value="interviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4 gap-2">
                    <div>
                      <CardTitle className="text-lg">Chi tiết các lịch phỏng vấn</CardTitle>
                      <CardDescription>Theo dõi danh sách các buổi phỏng vấn đã lên lịch hoặc hoàn thành.</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="rounded-xl shrink-0">
                          Lên lịch phỏng vấn
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                          <DialogTitle>Lên lịch phỏng vấn</DialogTitle>
                          <DialogDescription>
                            Tạo buổi phỏng vấn mới cho ứng viên và tự động gửi email thông báo.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="pt-2">
                          <CreateInterviewForm applicationId={application.id} interviewers={interviewers} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {application.interviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Chưa có lịch phỏng vấn nào.</p>
                  ) : (
                    <div className="grid gap-4">
                      {application.interviews.map((iv) => {
                        return (
                          <Card key={iv.id} className="border-border/80 bg-muted/20">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between gap-4">
                                <CardTitle className="text-base font-semibold">
                                  Lịch phỏng vấn: {new Date(iv.scheduled_at).toLocaleString("vi-VN")}
                                </CardTitle>
                                <Badge variant="outline" className="uppercase font-normal">{iv.status}</Badge>
                              </div>
                              <CardDescription className="text-xs">
                                Hình thức: {iv.type === "video" ? "Online (Video Call)" : iv.type === "onsite" ? "Trực tiếp (Onsite)" : "Gọi điện / Khác"} · Thời lượng: {iv.duration_minutes} phút
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                              {iv.users && (
                                <div className="space-y-1">
                                  <span className="text-muted-foreground block text-xs">Người phỏng vấn:</span>
                                  <span className="font-semibold text-foreground">
                                    {iv.users.fullName} ({iv.users.email})
                                  </span>
                                </div>
                              )}
                              {iv.meeting_link && (
                                <div className="space-y-1 pt-1">
                                  <span className="text-muted-foreground block text-xs">Link tham gia:</span>
                                  <a
                                    href={iv.meeting_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline break-all"
                                  >
                                    {iv.meeting_link}
                                  </a>
                                </div>
                              )}
                              {iv.location && (
                                <div className="space-y-1">
                                  <span className="text-muted-foreground block text-xs">Địa điểm:</span>
                                  <span className="font-medium text-foreground">{iv.location}</span>
                                </div>
                              )}
                              {iv.notes && (
                                <div className="space-y-1 pt-1">
                                  <span className="text-muted-foreground block text-xs">Ghi chú từ HR:</span>
                                  <p className="text-foreground bg-muted/40 p-3 rounded-xl border border-border/30 whitespace-pre-wrap leading-relaxed">
                                    {iv.notes}
                                  </p>
                                </div>
                              )}

                              {/* Evaluations/Score listing */}
                              {iv.interview_scores && iv.interview_scores.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-border/40 space-y-3">
                                  <span className="text-muted-foreground block text-xs font-semibold">Điểm đánh giá từ Interviewer:</span>
                                  {iv.interview_scores.map((score) => {
                                    return (
                                      <div key={score.id} className="p-3 bg-background rounded-xl border border-border/30 space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <span className="font-medium text-foreground">
                                            Đánh giá bởi: {score.users?.fullName || "Người chấm"}
                                          </span>
                                          <Badge variant={score.result === "pass" ? "default" : score.result === "hold" ? "secondary" : "destructive"}>
                                            Kết quả: {score.result.toUpperCase()}
                                          </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                          <div>
                                            <span className="text-muted-foreground block">Điểm chung</span>
                                            <span className="font-bold text-foreground text-sm">{score.overall_score || 0}/10</span>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground block">Kỹ thuật</span>
                                            <span className="font-semibold text-foreground">{score.technical_score || 0}/10</span>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground block">Giao tiếp</span>
                                            <span className="font-semibold text-foreground">{score.communication_score || 0}/10</span>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground block">Cultural Fit</span>
                                            <span className="font-semibold text-foreground">{score.cultural_fit_score || 0}/10</span>
                                          </div>
                                        </div>
                                        {score.feedback && (
                                          <p className="text-xs bg-muted/40 p-2 rounded-xl border border-border/20 mt-1">
                                            Phản hồi chi tiết: {score.feedback}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              {/* Action Link to Detail */}
                              <div className="mt-4 pt-3 border-t border-border/40 flex justify-end">
                                <Link
                                  href={`/dashboard/interviews/${iv.id}`}
                                  className="inline-flex h-8 items-center justify-center rounded-2xl border border-input/60 bg-background px-3 text-xs font-medium text-foreground hover:bg-muted transition-all cursor-pointer"
                                >
                                  Xem chi tiết phỏng vấn
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Nhật ký Email */}
            <TabsContent value="emails" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4 gap-2">
                    <div>
                      <CardTitle className="text-lg">Nhật ký gửi Email</CardTitle>
                      <CardDescription>Danh sách các email hệ thống đã gửi cho ứng viên.</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="rounded-xl shrink-0">
                          Gửi Email mới
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                          <DialogTitle>Gửi Email mới</DialogTitle>
                          <DialogDescription>
                            Soạn nội dung và gửi trực tiếp cho ứng viên qua Resend.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="pt-2">
                          <SendEmailForm applicationId={application.id} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {application.email_logs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Chưa có email nào.</p>
                  ) : (
                    <div className="grid gap-4 text-xs">
                      {application.email_logs.map((log) => {
                        let Icon = Mail01Icon;
                        if (log.type === "invite") Icon = Calendar01Icon;
                        if (log.type === "result") Icon = CheckmarkCircle01Icon;
                        if (log.type === "reminder") Icon = Notification01Icon;
                        if (log.type === "rejection") Icon = CancelCircleIcon;

                        return (
                          <Card key={log.id} className="bg-muted/20 p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-1">
                              <span className="font-semibold text-sm text-foreground flex items-center gap-2">
                                <HugeiconsIcon icon={Icon} className="size-6 text-muted-foreground shrink-0" />
                                {log.subject}
                              </span>
                              <span className="text-muted-foreground">
                                {log.sent_at ? new Date(log.sent_at).toLocaleString("vi-VN") : "—"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground">Loại email:</span>
                              <Badge variant="outline">{log.type}</Badge>
                              <span className="text-muted-foreground">Trạng thái:</span>
                              <Badge variant={log.status === "sent" ? "default" : "destructive"}>
                                {log.status}
                              </Badge>
                            </div>
                            {log.error_message && (
                              <p className="mt-1 text-destructive font-medium">
                                Lỗi: {log.error_message}
                              </p>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
