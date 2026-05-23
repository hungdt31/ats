"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01FreeIcons } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  useDashboardInterview,
  useUpdateDashboardInterviewStatus,
  useSubmitDashboardInterviewResult,
} from "@/hooks/use-dashboard-interviews";
import { interviews_status } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMe } from "@/hooks/use-me";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Đã lên lịch", variant: "outline" as const },
  { value: "completed", label: "Hoàn thành", variant: "default" as const },
  { value: "cancelled", label: "Huỷ bỏ", variant: "destructive" as const },
  { value: "rescheduled", label: "Dời lịch", variant: "secondary" as const },
];

type Params = Promise<{ id: string }>;

export default function InterviewDetailPage(props: { params: Params }) {
  const router = useRouter();
  const params = React.use(props.params);
  const interviewId = params.id;

  // Conclusion form state
  const [result, setResult] = useState<string>("pass");
  const [feedback, setFeedback] = useState<string>("");
  const [nextStatus, setNextStatus] = useState<string>("offered");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasPrefilled, setHasPrefilled] = useState(false);

  const { data: currentUser } = useMe();
  const { data, isLoading } = useDashboardInterview(interviewId);

  const updateStatusMutation = useUpdateDashboardInterviewStatus(interviewId);
  const submitResultMutation = useSubmitDashboardInterviewResult(interviewId);

  React.useEffect(() => {
    setHasPrefilled(false);
  }, [interviewId]);

  React.useEffect(() => {
    if (data && !hasPrefilled) {
      if (data.interview_results && data.interview_results.length > 0) {
        const resObj = data.interview_results[0];
        setResult(resObj.result || "pass");
        setFeedback(resObj.feedback || "");
        if (data.applications?.status && ["offered", "hired", "screening"].includes(data.applications.status)) {
          setNextStatus(data.applications.status);
        } else {
          setNextStatus("offered");
        }
      }
      setHasPrefilled(true);
    }
  }, [data, hasPrefilled]);

  const hasChanges = React.useMemo(() => {
    if (!data?.interview_results || data.interview_results.length === 0) {
      return true;
    }
    const existing = data.interview_results[0];
    const resultChanged = result !== existing.result;
    const feedbackChanged = feedback.trim() !== (existing.feedback || "").trim();
    const statusChanged = result === "pass" && nextStatus !== (data.applications?.status || "offered");
    return resultChanged || feedbackChanged || statusChanged;
  }, [result, feedback, nextStatus, data]);

  const handleUpdateStatus = async (status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ status: status as interviews_status });
      toast.success("Cập nhật trạng thái thành công!");
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi.");
    }
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitResultMutation.mutateAsync({
        result,
        feedback,
        next_status: result === "pass" ? nextStatus : undefined,
      });
      toast.success("Lưu kết luận cuối cùng thành công!");
      setIsDialogOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi.");
    }
  };

  const handleRevert = () => {
    if (data?.interview_results && data.interview_results.length > 0) {
      const resObj = data.interview_results[0];
      setResult(resObj.result || "pass");
      setFeedback(resObj.feedback || "");
      if (data.applications?.status && ["offered", "hired", "screening"].includes(data.applications.status)) {
        setNextStatus(data.applications.status);
      } else {
        setNextStatus("offered");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto py-12 text-center text-muted-foreground">
        Đang tải thông tin buổi phỏng vấn...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto py-12 text-center text-destructive">
        Không tìm thấy thông tin buổi phỏng vấn.
      </div>
    );
  }

  const currentStatusConfig = STATUS_OPTIONS.find((s) => s.value === data.status) || STATUS_OPTIONS[0];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/interviews"
            className="inline-flex h-9 items-center justify-center rounded-2xl border border-input/60 bg-background px-4 text-xs font-medium text-foreground hover:bg-muted transition-all gap-1.5"
          >
            <HugeiconsIcon icon={ArrowLeft01FreeIcons} className="size-4" /> Quay lại lịch trình
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st.value}
              disabled={updateStatusMutation.isPending || data.status === st.value}
              onClick={() => handleUpdateStatus(st.value)}
              className="inline-flex h-9 items-center justify-center rounded-2xl border border-input bg-background px-3 text-xs font-medium text-foreground hover:bg-muted transition-all disabled:opacity-50 cursor-pointer"
            >
              Đổi sang {st.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Chi tiết</CardTitle>
                <Badge variant={currentStatusConfig.variant}>{currentStatusConfig.label}</Badge>
              </div>
              <CardDescription className="text-xs uppercase">
                {data.type} phỏng vấn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Ứng viên</span>
                <span className="font-semibold text-foreground">
                  {data.applications?.users?.fullName || "—"}
                </span>
                <span className="text-xs text-muted-foreground block">
                  Email: {data.applications?.users?.email}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-xs">Vị trí ứng tuyển</span>
                <span className="font-medium text-foreground">
                  {data.applications?.jobs?.title || "—"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-xs mb-1">Hội đồng phỏng vấn</span>
                <div className="space-y-1.5">
                  {data.interview_evaluators?.map((evaluator: any) => {
                    let roleLabel = "";
                    let badgeVariant: "default" | "secondary" | "outline" = "outline";
                    switch (evaluator.role) {
                      case "final_reviewer":
                        roleLabel = "Final";
                        badgeVariant = "default";
                        break;
                      case "observer":
                        roleLabel = "Observer";
                        badgeVariant = "outline";
                        break;
                      default:
                        roleLabel = "Evaluator";
                        badgeVariant = "secondary";
                        break;
                    }
                    return (
                      <div key={evaluator.id} className="flex items-center justify-between text-xs bg-muted/30 p-2 rounded-xl border border-border/20">
                        <span className="font-semibold text-foreground">
                          {evaluator.users?.fullName}
                        </span>
                        <Badge variant={badgeVariant} className="text-[9px] px-1 py-0 uppercase">
                          {roleLabel}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div>
                <span className="text-muted-foreground block text-xs">Thời gian</span>
                <span className="font-semibold text-foreground">
                  {new Date(data.scheduled_at).toLocaleString("vi-VN")}
                </span>
                <span className="text-xs text-muted-foreground block">
                  Thời lượng: {data.duration_minutes} phút
                </span>
              </div>

              {data.meeting_link && (
                <div>
                  <span className="text-muted-foreground block text-xs">Link tham gia trực tuyến</span>
                  <a
                    href={data.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all block text-xs"
                  >
                    {data.meeting_link}
                  </a>
                </div>
              )}

              {data.location && (
                <div>
                  <span className="text-muted-foreground block text-xs">Địa điểm</span>
                  <span className="font-medium text-foreground">{data.location}</span>
                </div>
              )}

              {data.notes && (
                <div>
                  <span className="text-muted-foreground block text-xs">Ghi chú HR</span>
                  <p className="text-xs text-foreground bg-muted/40 p-3 rounded-xl border border-border/30 whitespace-pre-wrap leading-relaxed">
                    {data.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column scorecard & conclusions */}
        <div className="md:col-span-2 space-y-6">
          {(() => {
            const isFinalReviewer = data.interview_evaluators?.some(
              (ev: any) => ev.user_id === currentUser?.id && ev.role === "final_reviewer"
            );

            const hasResult = data.interview_results && data.interview_results.length > 0;

            if (isFinalReviewer) {
              const existingResult = (hasResult && data.interview_results) ? data.interview_results[0] : null;
              return (
                <Card className="border-border/80">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Kết luận cuối cùng</CardTitle>
                    <CardDescription className="text-xs">
                      Bạn là Final Reviewer của buổi phỏng vấn này. Nhập kết luận cuối để hoàn tất quy trình phỏng vấn và cập nhật hồ sơ ứng viên.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {existingResult && (
                      <div className="mb-4 p-3.5 bg-primary/[0.03] border border-primary/10 rounded-2xl text-xs space-y-1.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-semibold text-primary">Đã đánh giá kết luận trước đó</span>
                          <span className="text-muted-foreground font-medium">
                            Cập nhật lúc: {new Date(existingResult.created_at).toLocaleString("vi-VN")} bởi {existingResult.users?.fullName || "Final Reviewer"}
                          </span>
                        </div>
                        <p className="text-foreground/80 mt-1 bg-background/80 p-2.5 rounded-xl border border-border/20 italic">
                          Nhận xét cũ: "{existingResult.feedback || "Không có nhận xét"}"
                        </p>
                      </div>
                    )}
                    <form onSubmit={(e) => { e.preventDefault(); setIsDialogOpen(true); }} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-foreground">Kết quả đánh giá</label>
                          <Select value={result} onValueChange={setResult}>
                            <SelectTrigger className="w-full h-10 px-3 text-sm">
                              <SelectValue placeholder="Chọn kết quả" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                              <SelectItem value="pass">Đạt (Pass)</SelectItem>
                              <SelectItem value="fail">Không đạt (Fail)</SelectItem>
                              <SelectItem value="hold">Xem xét thêm (Hold)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {result === "pass" && (
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-foreground">Trạng thái tiếp theo của hồ sơ ứng viên</label>
                            <Select value={nextStatus} onValueChange={setNextStatus}>
                              <SelectTrigger className="w-full h-10 px-3 text-sm">
                                <SelectValue placeholder="Chọn trạng thái" />
                              </SelectTrigger>
                              <SelectContent className="bg-popover">
                                <SelectItem value="offered">Đã gửi Offer (Offered)</SelectItem>
                                <SelectItem value="hired">Đã tuyển (Hired)</SelectItem>
                                <SelectItem value="screening">Quay lại Sàng lọc (Screening)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-foreground">Nhận xét tổng hợp & feedback hội đồng</label>
                        <Textarea
                          rows={3}
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Nhập nhận xét tổng hợp kết luận của hội đồng phỏng vấn..."
                          className="flex min-h-[80px] w-full p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          required
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        {existingResult && hasChanges && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleRevert}
                            disabled={submitResultMutation.isPending}
                            className="rounded-2xl"
                          >
                            Khôi phục giá trị cũ
                          </Button>
                        )}
                        <Button
                          type="submit"
                          disabled={submitResultMutation.isPending || !hasChanges}
                          className="rounded-2xl"
                        >
                          Lưu kết luận cuối cùng
                        </Button>
                      </div>

                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="sm:max-w-md rounded-2xl border-border/80 bg-background">
                          <DialogHeader>
                            <DialogTitle className="text-lg font-bold">Xác nhận kết luận phỏng vấn</DialogTitle>
                            <DialogDescription className="text-xs">
                              Bạn có chắc chắn muốn lưu kết luận này? Trạng thái của đơn ứng tuyển sẽ tự động thay đổi tương ứng.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-2 text-xs space-y-3">
                            <div className="flex justify-between items-center bg-muted/40 p-2.5 rounded-xl border border-border/30">
                              <span className="font-semibold text-muted-foreground">KẾT QUẢ CHỐT:</span>
                              <Badge
                                variant={
                                  result === "pass"
                                    ? "default"
                                    : result === "hold"
                                      ? "secondary"
                                      : "destructive"
                                }
                                className="uppercase text-[10px]"
                              >
                                {result === "pass" ? "Đạt (Pass)" : result === "hold" ? "Xem xét thêm (Hold)" : "Không đạt (Fail)"}
                              </Badge>
                            </div>
                            {result === "pass" && (
                              <div className="flex justify-between items-center bg-muted/40 p-2.5 rounded-xl border border-border/30">
                                <span className="font-semibold text-muted-foreground">TRẠNG THÁI TIẾP THEO:</span>
                                <Badge variant="outline" className="capitalize text-[10px]">
                                  {nextStatus === "offered" ? "Đã gửi Offer" : nextStatus === "hired" ? "Đã tuyển" : "Sàng lọc"}
                                </Badge>
                              </div>
                            )}
                            {feedback && (
                              <div className="bg-muted/40 p-3 rounded-xl border border-border/30">
                                <span className="font-semibold text-muted-foreground block mb-1">Nhận xét tổng hợp:</span>
                                <p className="text-foreground whitespace-pre-wrap leading-relaxed italic">
                                  "{feedback}"
                                </p>
                              </div>
                            )}
                          </div>
                          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/30">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsDialogOpen(false)}
                              disabled={submitResultMutation.isPending}
                              className="rounded-xl h-10 text-xs"
                            >
                              Hủy bỏ
                            </Button>
                            <Button
                              type="button"
                              onClick={(e) => { e.preventDefault(); void handleSubmitResult(e); }}
                              disabled={submitResultMutation.isPending}
                              className="rounded-xl h-10 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                            >
                              {submitResultMutation.isPending ? "Đang xử lý..." : "Xác nhận & Lưu"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </form>
                  </CardContent>
                </Card>
              );
            }

            if (hasResult && data.interview_results) {
              const resObj = data.interview_results[0];
              return (
                <Card className="border-border/80 bg-primary/[0.01]">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">Kết luận cuối cùng từ Hội đồng</CardTitle>
                    <CardDescription className="text-xs">
                      Quyết định phỏng vấn đã được chốt và đồng bộ trạng thái đơn ứng tuyển.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-background p-3 rounded-xl border border-border/30">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">KẾT QUẢ CUỐI CÙNG</span>
                        <Badge
                          variant={
                            resObj.result === "pass"
                              ? "default"
                              : resObj.result === "hold"
                                ? "secondary"
                                : "destructive"
                          }
                          className="uppercase text-xs"
                        >
                          {resObj.result === "pass" ? "ĐẠT (PASS)" : resObj.result === "hold" ? "XEM XÉT THÊM (HOLD)" : "KHÔNG ĐẠT (FAIL)"}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">THỜI GIAN ĐÁNH GIÁ</span>
                        <span className="font-semibold text-xs text-foreground block mt-1">
                          {new Date(resObj.created_at).toLocaleString("vi-VN")}
                        </span>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-[10px] text-muted-foreground block">NGƯỜI KẾT LUẬN</span>
                        <span className="font-semibold text-xs text-foreground block mt-1">
                          {resObj.users?.fullName || "Final Reviewer"}
                        </span>
                      </div>
                    </div>

                    {resObj.feedback && (
                      <div className="space-y-1 bg-background p-3 rounded-xl border border-border/30 text-xs">
                        <span className="text-muted-foreground block font-medium">Feedback / Nhận xét tổng hợp</span>
                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                          {resObj.feedback}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            }

            return null;
          })()}

          <Card className="border-border/80">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
              <div>
                <CardTitle className="text-lg">Bảng điểm đánh giá</CardTitle>
                <CardDescription className="text-xs">
                  Kết quả đánh giá từ phỏng vấn viên.
                </CardDescription>
              </div>
              <Link
                href={`/dashboard/interviews/${interviewId}/score`}
                className="inline-flex h-9 items-center justify-center rounded-2xl bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
              >
                + Thêm đánh giá / Chấm điểm
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dynamic Average Scores Section */}
              {data.interview_scores && data.interview_scores.length > 0 && (
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-4">
                  <span className="font-semibold text-primary text-xs block mb-2">
                    Điểm trung bình cộng ({data.interview_scores.length} lượt đánh giá):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    {(() => {
                      const scores = data.interview_scores;
                      let techSum = 0, commSum = 0, cultSum = 0, probSum = 0, overallSum = 0;
                      let techCount = 0, commCount = 0, cultCount = 0, probCount = 0, overallCount = 0;

                      scores.forEach((s: any) => {
                        if (s.technical_score !== null && s.technical_score !== undefined) {
                          techSum += s.technical_score;
                          techCount++;
                        }
                        if (s.communication_score !== null && s.communication_score !== undefined) {
                          commSum += s.communication_score;
                          commCount++;
                        }
                        if (s.cultural_fit_score !== null && s.cultural_fit_score !== undefined) {
                          cultSum += s.cultural_fit_score;
                          cultCount++;
                        }
                        if (s.problem_solving_score !== null && s.problem_solving_score !== undefined) {
                          probSum += s.problem_solving_score;
                          probCount++;
                        }

                        // Calculate overall for this evaluator (average of all non-null scores)
                        const scoreList = [
                          s.technical_score,
                          s.communication_score,
                          s.cultural_fit_score,
                          s.problem_solving_score
                        ].filter((val) => val !== null && val !== undefined);
                        if (scoreList.length > 0) {
                          const sum = scoreList.reduce((acc: number, curr: number) => acc + curr, 0);
                          overallSum += sum / scoreList.length;
                          overallCount++;
                        }
                      });

                      const avgTech = techCount > 0 ? (techSum / techCount).toFixed(1) : "0";
                      const avgComm = commCount > 0 ? (commSum / commCount).toFixed(1) : "0";
                      const avgCult = cultCount > 0 ? (cultSum / cultCount).toFixed(1) : "0";
                      const avgProb = probCount > 0 ? (probSum / probCount).toFixed(1) : "0";
                      const avgOverall = overallCount > 0 ? (overallSum / overallCount).toFixed(1) : "0";

                      return (
                        <>
                          <div className="bg-background p-2 rounded-xl border border-border/30">
                            <span className="text-[10px] text-muted-foreground block">Kỹ thuật</span>
                            <span className="text-sm font-bold text-foreground">{avgTech}/10</span>
                          </div>
                          <div className="bg-background p-2 rounded-xl border border-border/30">
                            <span className="text-[10px] text-muted-foreground block">Giao tiếp</span>
                            <span className="text-sm font-bold text-foreground">{avgComm}/10</span>
                          </div>
                          <div className="bg-background p-2 rounded-xl border border-border/30">
                            <span className="text-[10px] text-muted-foreground block">Cultural Fit</span>
                            <span className="text-sm font-bold text-foreground">{avgCult}/10</span>
                          </div>
                          <div className="bg-background p-2 rounded-xl border border-border/30">
                            <span className="text-[10px] text-muted-foreground block">Problem Solving</span>
                            <span className="text-sm font-bold text-foreground">{avgProb}/10</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {data.interview_scores && data.interview_scores.length > 0 ? (
                <Accordion type="multiple" className="w-full border-none p-0 gap-3 flex flex-col bg-transparent">
                  {data.interview_scores.map((score: any) => {
                    const evaluatorInfo = data.interview_evaluators?.find((ev: any) => ev.user_id === score.evaluator_id);
                    let roleLabel = "Evaluator";
                    let roleBadgeVariant: "default" | "secondary" | "outline" = "secondary";
                    if (evaluatorInfo?.role === "final_reviewer") {
                      roleLabel = "Final Reviewer";
                      roleBadgeVariant = "default";
                    } else if (evaluatorInfo?.role === "observer") {
                      roleLabel = "Observer";
                      roleBadgeVariant = "outline";
                    }

                    // Calculate itemOverall score dynamically
                    const scoreList = [
                      score.technical_score,
                      score.communication_score,
                      score.cultural_fit_score,
                      score.problem_solving_score
                    ].filter((v) => v !== null && v !== undefined);
                    const itemOverall = scoreList.length > 0
                      ? (scoreList.reduce((a, b) => a + b, 0) / scoreList.length).toFixed(1)
                      : "0";

                    return (
                      <AccordionItem key={score.id} value={score.id} className="border border-border/40 rounded-2xl overflow-hidden bg-muted/20">
                        <AccordionTrigger className="hover:no-underline hover:bg-muted/40 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-4 w-full pr-4">
                            <div className="text-left">
                              <span className="font-bold text-foreground text-sm block">
                                {score.users?.fullName || "—"}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                Vai trò: <Badge variant={roleBadgeVariant} className="text-[9px] px-1 py-0 scale-90 origin-left font-normal uppercase">{roleLabel}</Badge>
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <Badge className="font-bold bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-colors text-xs border-none">
                                {itemOverall}/10
                              </Badge>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-0 border-t border-border/20 bg-background/50">
                          <div className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-background p-3 rounded-xl border border-border/30 text-xs">
                              <div>
                                <span className="text-muted-foreground block">Kỹ thuật</span>
                                <span className="font-bold text-foreground text-sm">{score.technical_score}/10</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Giao tiếp</span>
                                <span className="font-bold text-foreground text-sm">{score.communication_score}/10</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Cultural Fit</span>
                                <span className="font-bold text-foreground text-sm">{score.cultural_fit_score}/10</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Problem Solving</span>
                                <span className="font-bold text-foreground text-sm">{score.problem_solving_score}/10</span>
                              </div>
                            </div>

                            {score.strengths && (
                              <div className="space-y-1">
                                <span className="text-muted-foreground block text-xs font-medium">Điểm mạnh</span>
                                <p className="text-xs text-foreground bg-background p-2.5 rounded-xl border border-border/30 leading-relaxed">
                                  {score.strengths}
                                </p>
                              </div>
                            )}

                            {score.weaknesses && (
                              <div className="space-y-1">
                                <span className="text-muted-foreground block text-xs font-medium">Điểm cần cải thiện</span>
                                <p className="text-xs text-foreground bg-background p-2.5 rounded-xl border border-border/30 leading-relaxed">
                                  {score.weaknesses}
                                </p>
                              </div>
                            )}

                            {score.feedback && (
                              <div className="space-y-1">
                                <span className="text-muted-foreground block text-xs font-medium">Nhận xét chi tiết</span>
                                <p className="text-xs text-foreground bg-background p-2.5 rounded-xl border border-border/30 leading-relaxed">
                                  {score.feedback}
                                </p>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Chưa có đánh giá nào cho buổi phỏng vấn này.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
