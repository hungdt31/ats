"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Toàn thời gian (Full-time)" },
  { value: "part_time", label: "Bán thời gian (Part-time)" },
  { value: "contract", label: "Hợp đồng (Contract)" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Bản nháp (Draft)" },
  { value: "active", label: "Đăng tuyển (Active)" },
  { value: "closed", label: "Đã đóng (Closed)" },
  { value: "archived", label: "Lưu trữ (Archived)" },
];

type Params = Promise<{ id: string }>;

export default function EditJobPage(props: { params: Params }) {
  const router = useRouter();
  const params = React.use(props.params);
  const jobId = params.id;

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [headcount, setHeadcount] = useState("1");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [employmentType, setEmploymentType] = useState("full_time");
  const [status, setStatus] = useState("draft");
  const [expiresAt, setExpiresAt] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("");
  const [isPending, setIsPending] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "jobs", jobId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/jobs/${jobId}`);
      if (!res.ok) throw new Error("Không thể tải tin.");
      const json = await res.json();
      return json.data;
    },
  });

  useEffect(() => {
    if (data) {
      setTitle(data.title || "");
      setDepartment(data.department || "");
      setLocation(data.location || "");
      setHeadcount(data.headcount?.toString() || "1");
      setSalaryMin(data.salary_min?.toString() || "");
      setSalaryMax(data.salary_max?.toString() || "");
      setEmploymentType(data.employment_type || "full_time");
      setStatus(data.status || "draft");
      setExpiresAt(data.expires_at ? data.expires_at.split("T")[0] : "");
      setDescription(data.description || "");
      setRequirements(data.requirements || "");
      setBenefits(data.benefits || "");

      if (data.required_skills) {
        try {
          const parsed = typeof data.required_skills === "string" 
            ? JSON.parse(data.required_skills) 
            : data.required_skills;
          if (Array.isArray(parsed)) {
            setRequiredSkills(parsed.join(", "));
          }
        } catch (e) {
          setRequiredSkills("");
        }
      }
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error("Vui lòng nhập tiêu đề và mô tả công việc.");
      return;
    }

    setIsPending(true);
    try {
      const skillsArray = requiredSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(`/api/dashboard/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          requirements,
          benefits,
          location,
          department,
          salary_min: salaryMin ? parseInt(salaryMin, 10) : null,
          salary_max: salaryMax ? parseInt(salaryMax, 10) : null,
          employment_type: employmentType,
          required_skills: skillsArray.length > 0 ? skillsArray : null,
          headcount: headcount ? parseInt(headcount, 10) : 1,
          status,
          expires_at: expiresAt || null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Lỗi cập nhật tin tuyển dụng.");
      }

      toast.success("Cập nhật tin tuyển dụng thành công!");
      router.push("/dashboard/jobs");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi.");
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl mx-auto py-12 text-center text-muted-foreground">
        Đang tải thông tin tin tuyển dụng...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl mx-auto py-12 text-center text-destructive">
        Không tìm thấy tin tuyển dụng.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/jobs"
          className="inline-flex h-9 items-center justify-center rounded-2xl border border-input/60 bg-background px-4 text-xs font-medium text-foreground hover:bg-muted transition-all"
        >
          ← Quay lại danh sách
        </Link>
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-xl">Chỉnh sửa tin tuyển dụng</CardTitle>
          <CardDescription className="text-sm">
            Cập nhật lại thông tin tuyển dụng, thay đổi trạng thái đăng tuyển.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Tiêu đề tin tuyển dụng</label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-2xl h-10 px-3 border border-input/60 bg-background"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Bộ phận / Phòng ban</label>
                <Input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="rounded-2xl h-10 px-3 border border-input/60 bg-background"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Địa điểm làm việc</label>
                <Input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="rounded-2xl h-10 px-3 border border-input/60 bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Số lượng cần tuyển (Headcount)</label>
                <Input
                  type="number"
                  min={1}
                  value={headcount}
                  onChange={(e) => setHeadcount(e.target.value)}
                  className="rounded-2xl h-10 px-3 border border-input/60 bg-background"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Hạn ứng tuyển</label>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="rounded-2xl h-10 px-3 border border-input/60 bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Lương tối thiểu (VND/Tháng)</label>
                <Input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="rounded-2xl h-10 px-3 border border-input/60 bg-background"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Lương tối đa (VND/Tháng)</label>
                <Input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="rounded-2xl h-10 px-3 border border-input/60 bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Hình thức làm việc</label>
                <Select value={employmentType} onValueChange={(val) => setEmploymentType(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn hình thức" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {EMPLOYMENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Trạng thái đăng tuyển</label>
                <Select value={status} onValueChange={(val) => setStatus(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {STATUS_OPTIONS.map((st) => (
                      <SelectItem key={st.value} value={st.value}>
                        {st.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Kỹ năng yêu cầu (Cách nhau bằng dấu phẩy)</label>
              <Input
                type="text"
                placeholder="Ví dụ: React, Node.js, TypeScript..."
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                className="rounded-2xl h-10 px-3 border border-input/60 bg-background"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Mô tả công việc</label>
              <Textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-2xl p-3 border border-input/60 bg-background"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Yêu cầu ứng viên</label>
              <Textarea
                rows={4}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="rounded-2xl p-3 border border-input/60 bg-background"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Quyền lợi</label>
              <Textarea
                rows={4}
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                className="rounded-2xl p-3 border border-input/60 bg-background"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex h-10 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isPending ? "Đang xử lý..." : "Lưu tin tuyển dụng"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
