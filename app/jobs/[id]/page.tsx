"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, notFound, useRouter } from "next/navigation";
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01FreeIcons } from "@hugeicons/core-free-icons";

import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { employmentTypeLabel, formatSalaryRange } from "@/lib/data/jobs-utils";
import { ApiError } from "@/lib/api-client";
import { useMe } from "@/hooks/use-me";
import { useJob } from "@/hooks/use-job";
import { useApplyJob } from "@/hooks/use-candidate";
import { CVUpload } from "@/components/candidate/CVUpload";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";
  const router = useRouter();

  const { data: user } = useMe();
  const { data: job, isLoading, error } = useJob(id);

  // Apply mutation & local state for dialog
  const applyMutation = useApplyJob(id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cvFileUrl, setCvFileUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [applyError, setApplyError] = useState<string | null>(null);
  const [newFileInfo, setNewFileInfo] = useState<any | null>(null);
  const [cvFilename, setCvFilename] = useState("");

  // 404 từ API → Next.js notFound()
  if (error instanceof ApiError && error.status === 404) {
    notFound();
  }

  if (isLoading) {
    return (
      <div className="min-h-svh bg-muted/30 px-4 py-10 flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-svh bg-muted/30 px-4 py-10 flex items-center justify-center">
        <p className="text-destructive">Không thể tải tin tuyển dụng. Vui lòng thử lại.</p>
      </div>
    );
  }

  if (!job) return null;

  const salary = formatSalaryRange(job.salary_min, job.salary_max);
  const meta = [job.department, job.category, job.location].filter(Boolean).join(" · ");
  const publishedDate = job.published_at ? new Date(job.published_at).toLocaleDateString("vi-VN") : null;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError(null);

    if (!cvFileUrl.trim()) {
      setApplyError("Vui lòng cung cấp link CV của bạn.");
      return;
    }

    try {
      await applyMutation.mutateAsync({
        cv_file_url: cvFileUrl,
        cv_filename: cvFilename || (newFileInfo ? newFileInfo.fileName : "CV_Candidate.pdf"),
        cover_letter: coverLetter,
      });

      // Register new file in user's personal files only if application was successful!
      if (newFileInfo) {
        try {
          await fetch("/api/candidate/files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              file_name: newFileInfo.fileName,
              file_url: newFileInfo.fileUrl,
              file_type: "cv",
              appwrite_id: newFileInfo.appwriteId,
            }),
          });
        } catch (fileErr) {
          console.error("[Register personal file error after apply]", fileErr);
        }
      }

      // Navigate to candidate profile after success
      setIsDialogOpen(false);
      router.push("/candidate");
    } catch (err: any) {
      if (err instanceof ApiError) {
        setApplyError(err.message);
      } else {
        setApplyError("Không thể gửi đơn ứng tuyển. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="min-h-svh flex flex-col bg-muted/30">
      <SiteHeader user={user} />

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground gap-2" asChild>
          <Link href="/jobs">
            <HugeiconsIcon icon={ArrowLeft01FreeIcons} /> Danh sách việc làm
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cột chính: Chi tiết công việc */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="gap-2">
                <CardTitle className="font-heading text-2xl font-bold">{job.title}</CardTitle>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardDescription>
                    Ngày đăng tuyển: {publishedDate ?? "Đang tuyển"}
                  </CardDescription>
                  {job.headcount && (
                    <span className="text-xs font-semibold text-muted-foreground bg-muted/50 border border-border/60 px-2.5 py-1 rounded-2xl shrink-0">
                      Số lượng: {job.headcount}
                    </span>
                  )}
                </div>
                {salary ? <p className="text-xl font-semibold text-primary">{salary}</p> : null}
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Mô tả
                  </h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{job.description}</div>
                </section>
                {job.requirements ? (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Yêu cầu
                    </h3>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{job.requirements}</div>
                  </section>
                ) : null}
                {job.benefits ? (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Quyền lợi
                    </h3>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{job.benefits}</div>
                  </section>
                ) : null}
                <Separator />
                <div className="flex flex-wrap gap-2">
                  {user ? (
                    job.hasApplied ? (
                      <Button asChild variant="outline">
                        <Link href="/candidate">Xem đơn ứng tuyển</Link>
                      </Button>
                    ) : (
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>Ứng tuyển ngay</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Ứng tuyển vị trí</DialogTitle>
                            <DialogDescription className="text-base font-medium text-primary">
                              {job.title}
                            </DialogDescription>
                          </DialogHeader>

                          <form onSubmit={handleApply} className="space-y-4">
                            {applyError && (
                              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                                {applyError}
                              </div>
                            )}

                            <CVUpload value={cvFileUrl} onChange={setCvFileUrl} onFileNameChange={setCvFilename} onNewFileUpload={setNewFileInfo} />

                            <Field className="space-y-1.5">
                              <FieldLabel htmlFor="cover_letter_dialog" className="text-xs font-medium text-foreground">
                                Thư giới thiệu (Cover Letter)
                              </FieldLabel>
                              <textarea
                                id="cover_letter_dialog"
                                rows={4}
                                placeholder="Giới thiệu ngắn gọn về bản thân..."
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                className="flex w-full rounded-2xl border border-transparent bg-input/50 px-4 py-3 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 data-placeholder:text-muted-foreground"
                              />
                            </Field>

                            <div className="flex justify-end gap-2 pt-2">
                              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                                Hủy
                              </Button>
                              <Button type="submit" disabled={applyMutation.isPending}>
                                {applyMutation.isPending ? "Đang gửi..." : "Gửi hồ sơ"}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )
                  ) : (
                    <Button asChild>
                      <Link
                        href={`/login?callbackUrl=${encodeURIComponent(`/jobs/${job.id}`)}`}
                        prefetch={false}
                      >
                        Đăng nhập để ứng tuyển
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" asChild>
                    <Link href="/jobs">Xem tin khác</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cột bên phải: Sidebar thông tin tóm tắt */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Thông tin chung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Hình thức:</span>
                  <span className="font-medium text-foreground">{employmentTypeLabel(job.employment_type)}</span>
                </div>
                {job.location && (
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Địa điểm:</span>
                    <span className="font-medium text-foreground">{job.location}</span>
                  </div>
                )}
                {job.department && (
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Phòng ban:</span>
                    <span className="font-medium text-foreground">{job.department}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Ngày hết hạn:</span>
                  <span className="font-medium text-foreground">
                    {job.expires_at ? new Date(job.expires_at).toLocaleDateString("vi-VN") : "Không giới hạn"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Kỹ năng yêu cầu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.category && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Ngành nghề</span>
                    <span className="text-sm font-medium text-foreground">{job.category}</span>
                  </div>
                )}
                <Separator />
                {job.required_skills && job.required_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {job.required_skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="h-6 rounded-md">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Không yêu cầu kỹ năng cụ thể.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
