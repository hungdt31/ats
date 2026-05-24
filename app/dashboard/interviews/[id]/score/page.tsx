"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01FreeIcons } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useDashboardInterview,
  useCreateDashboardInterviewScore,
} from "@/hooks/use-dashboard-interviews";
import { useMe } from "@/hooks/use-me";

type Params = Promise<{ id: string }>;

export default function InterviewScorePage(props: { params: Params }) {
  const router = useRouter();
  const params = React.use(props.params);
  const interviewId = params.id;

  const [technicalScore, setTechnicalScore] = useState("5");
  const [communicationScore, setCommunicationScore] = useState("5");
  const [culturalFitScore, setCulturalFitScore] = useState("5");
  const [problemSolvingScore, setProblemSolvingScore] = useState("5");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [feedback, setFeedback] = useState("");

  const { data: meData } = useMe();
  const { data, isLoading } = useDashboardInterview(interviewId);
  const scoreMutation = useCreateDashboardInterviewScore(interviewId);

  const existingScore = React.useMemo(() => {
    return data?.interview_scores?.find(
      (s: any) => s.evaluator_id === meData?.id
    );
  }, [data, meData]);

  React.useEffect(() => {
    if (existingScore) {
      setTechnicalScore(String(existingScore.technical_score ?? "5"));
      setCommunicationScore(String(existingScore.communication_score ?? "5"));
      setCulturalFitScore(String(existingScore.cultural_fit_score ?? "5"));
      setProblemSolvingScore(String(existingScore.problem_solving_score ?? "5"));
      setStrengths(existingScore.strengths ?? "");
      setWeaknesses(existingScore.weaknesses ?? "");
      setFeedback(existingScore.feedback ?? "");
    }
  }, [existingScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await scoreMutation.mutateAsync({
        technical_score: parseInt(technicalScore, 10),
        communication_score: parseInt(communicationScore, 10),
        cultural_fit_score: parseInt(culturalFitScore, 10),
        problem_solving_score: parseInt(problemSolvingScore, 10),
        strengths,
        weaknesses,
        feedback,
        result: "pass", // placeholder — evaluator không chọn result
      });

      toast.success("Đã lưu bảng điểm đánh giá thành công!");
      router.push(`/dashboard/interviews/${interviewId}`);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi.";
      toast.error(message);
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

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/interviews/${interviewId}`}
          className="inline-flex h-9 items-center justify-center rounded-2xl border border-input/60 bg-background px-4 text-xs font-medium text-foreground hover:bg-muted transition-all gap-1.5"
        >
          <HugeiconsIcon icon={ArrowLeft01FreeIcons} className="size-4" /> Quay lại chi tiết buổi PV
        </Link>
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-xl">
            {existingScore ? "Chỉnh sửa đánh giá của bạn" : "Chấm điểm & Đánh giá ứng viên"}
          </CardTitle>
          <CardDescription className="text-sm">
            Ứng viên: <strong>{data.applications?.users?.fullName}</strong> · Vị trí: <strong>{data.applications?.jobs?.title}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Kỹ thuật (1-10)</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={technicalScore}
                  onChange={(e) => setTechnicalScore(e.target.value)}
                  className="rounded-2xl h-10 px-3"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Giao tiếp (1-10)</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={communicationScore}
                  onChange={(e) => setCommunicationScore(e.target.value)}
                  className="rounded-2xl h-10 px-3"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Cultural Fit (1-10)</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={culturalFitScore}
                  onChange={(e) => setCulturalFitScore(e.target.value)}
                  className="rounded-2xl h-10 px-3"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Problem Solving (1-10)</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={problemSolvingScore}
                  onChange={(e) => setProblemSolvingScore(e.target.value)}
                  className="rounded-2xl h-10 px-3"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Điểm mạnh</label>
              <Textarea
                rows={2}
                placeholder="Khả năng tư duy logic tốt, am hiểu sâu sắc..."
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                className="rounded-2xl p-3"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Điểm cần cải thiện</label>
              <Textarea
                rows={2}
                placeholder="Cần cải thiện giao tiếp tiếng Anh..."
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
                className="rounded-2xl p-3"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Phản hồi chi tiết (Feedback)</label>
              <Textarea
                rows={3}
                placeholder="Nhận xét tổng hợp về ứng viên..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="rounded-2xl p-3"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={scoreMutation.isPending}
                className="flex h-10 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {scoreMutation.isPending
                  ? "Đang xử lý..."
                  : existingScore
                    ? "Cập nhật đánh giá"
                    : "Lưu đánh giá"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
