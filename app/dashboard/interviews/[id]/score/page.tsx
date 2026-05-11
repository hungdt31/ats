"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01FreeIcons } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const RESULT_OPTIONS = [
  { value: "pass", label: "Đạt (Pass)" },
  { value: "fail", label: "Không đạt (Fail)" },
  { value: "hold", label: "Cân nhắc thêm (Hold)" },
];

type Params = Promise<{ id: string }>;

export default function InterviewScorePage(props: { params: Params }) {
  const router = useRouter();
  const params = React.use(props.params);
  const interviewId = params.id;

  const [technicalScore, setTechnicalScore] = useState("5");
  const [communicationScore, setCommunicationScore] = useState("5");
  const [culturalFitScore, setCulturalFitScore] = useState("5");
  const [overallScore, setOverallScore] = useState("5");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState("pass");
  const [isFinal, setIsFinal] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "interviews", interviewId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/interviews/${interviewId}`);
      if (!res.ok) throw new Error("Không thể tải thông tin.");
      const json = await res.json();
      return json.data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) {
      toast.error("Vui lòng chọn kết quả đánh giá.");
      return;
    }

    setIsPending(true);
    try {
      const res = await fetch(`/api/dashboard/interviews/${interviewId}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technical_score: parseInt(technicalScore, 10),
          communication_score: parseInt(communicationScore, 10),
          cultural_fit_score: parseInt(culturalFitScore, 10),
          overall_score: parseInt(overallScore, 10),
          strengths,
          weaknesses,
          feedback,
          result,
          is_final: isFinal,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Lỗi lưu bảng điểm.");
      }

      toast.success("Đã lưu bảng điểm đánh giá thành công!");
      router.push(`/dashboard/interviews/${interviewId}`);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi.";
      toast.error(message);
    } finally {
      setIsPending(false);
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
          <CardTitle className="text-xl">Chấm điểm & Đánh giá ứng viên</CardTitle>
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
                <label className="text-xs font-semibold text-foreground">Điểm chung (1-10)</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={overallScore}
                  onChange={(e) => setOverallScore(e.target.value)}
                  className="rounded-2xl h-10 px-3"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Kết quả đánh giá tổng thể</label>
              <Select value={result} onValueChange={(val) => setResult(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn kết quả" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {RESULT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="flex items-center gap-2 select-none">
              <Checkbox
                id="is-final-check"
                checked={isFinal}
                onCheckedChange={(checked) => setIsFinal(checked === true)}
              />
              <label htmlFor="is-final-check" className="text-xs font-medium text-foreground cursor-pointer">
                Đánh dấu đây là kết quả đánh giá cuối cùng (Is Final)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex h-10 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isPending ? "Đang xử lý..." : "Lưu đánh giá"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
