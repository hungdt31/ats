"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01FreeIcons } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { useCreateDashboardJob } from "@/hooks/use-dashboard-jobs";

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Toàn thời gian (Full-time)" },
  { value: "part_time", label: "Bán thời gian (Part-time)" },
  { value: "contract", label: "Hợp đồng (Contract)" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Bản nháp (Draft)" },
  { value: "active", label: "Đăng tuyển (Active)" },
];

export default function NewJobPage() {
  const router = useRouter();
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

  const createMutation = useCreateDashboardJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error("Vui lòng nhập tiêu đề và mô tả công việc.");
      return;
    }

    try {
      const skillsArray = requiredSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await createMutation.mutateAsync({
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
      });

      toast.success("Tạo tin tuyển dụng thành công!");
      router.push("/dashboard/jobs");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Đã xảy ra lỗi.";
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/jobs"
          className="inline-flex h-9 items-center justify-center rounded-2xl border border-input/60 bg-background px-4 text-xs font-medium text-foreground hover:bg-muted transition-all gap-1.5"
        >
          <HugeiconsIcon icon={ArrowLeft01FreeIcons} className="size-4" /> Quay lại danh sách
        </Link>
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-xl">Tạo tin tuyển dụng mới</CardTitle>
          <CardDescription className="text-sm">
            Cung cấp đầy đủ thông tin để đăng tuyển công việc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel className="font-medium text-foreground">Tiêu đề tin tuyển dụng</FieldLabel>
              <Input
                type="text"
                placeholder="Ví dụ: Senior Frontend Developer (React, Next.js)..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10"
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="font-medium text-foreground">Bộ phận / Phòng ban</FieldLabel>
                <Input
                  type="text"
                  placeholder="Ví dụ: Kỹ thuật, Marketing..."
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-10"
                />
              </Field>

              <Field>
                <FieldLabel className="font-medium text-foreground">Địa điểm làm việc</FieldLabel>
                <Input
                  type="text"
                  placeholder="Ví dụ: Quận 1, TPHCM / Remote..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-10"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="font-medium text-foreground">Số lượng cần tuyển (Headcount)</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  value={headcount}
                  onChange={(e) => setHeadcount(e.target.value)}
                  className="h-10"
                  required
                />
              </Field>

              <Field>
                <FieldLabel className="font-medium text-foreground">Hạn ứng tuyển</FieldLabel>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="h-10"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="font-medium text-foreground">Lương tối thiểu (VND/Tháng)</FieldLabel>
                <Input
                  type="number"
                  placeholder="Ví dụ: 15000000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="h-10"
                />
              </Field>

              <Field>
                <FieldLabel className="font-medium text-foreground">Lương tối đa (VND/Tháng)</FieldLabel>
                <Input
                  type="number"
                  placeholder="Ví dụ: 30000000"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="h-10"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="font-medium text-foreground">Hình thức làm việc</FieldLabel>
                <Select value={employmentType} onValueChange={(val) => setEmploymentType(val)}>
                  <SelectTrigger className="w-full h-10">
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
              </Field>

              <Field>
                <FieldLabel className="font-medium text-foreground">Trạng thái đăng tuyển</FieldLabel>
                <Select value={status} onValueChange={(val) => setStatus(val)}>
                  <SelectTrigger className="w-full h-10">
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
              </Field>
            </div>

            <Field>
              <FieldLabel className="font-medium text-foreground">Kỹ năng yêu cầu (Cách nhau bằng dấu phẩy)</FieldLabel>
              <Input
                type="text"
                placeholder="Ví dụ: React, Node.js, TypeScript..."
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                className="h-10"
              />
            </Field>

            <Field>
              <FieldLabel className="font-medium text-foreground">Mô tả công việc</FieldLabel>
              <Textarea
                rows={4}
                placeholder="Mô tả công việc chi tiết..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel className="font-medium text-foreground">Yêu cầu ứng viên</FieldLabel>
              <Textarea
                rows={4}
                placeholder="Các yêu cầu kỹ thuật, kinh nghiệm..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel className="font-medium text-foreground">Quyền lợi</FieldLabel>
              <Textarea
                rows={4}
                placeholder="Các quyền lợi, chính sách đãi ngộ..."
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex h-10 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {createMutation.isPending ? "Đang xử lý..." : "Lưu tin tuyển dụng"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
