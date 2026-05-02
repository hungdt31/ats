"use client";

import { useState, useMemo } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { JobCardPreview } from "@/components/landing/job-card";
import { useMe } from "@/hooks/use-me";
import { useJobs } from "@/hooks/use-jobs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employmentTypeLabel } from "@/lib/data/jobs-utils";

export default function JobsPage() {
  const { data: user } = useMe();
  const { data: jobs, isLoading, isError } = useJobs();

  // Filter states
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedEmpType, setSelectedEmpType] = useState("all");

  const resetFilters = () => {
    setSearchTitle("");
    setSelectedLocation("all");
    setSelectedDepartment("all");
    setSelectedEmpType("all");
  };

  // Extract unique filter options dynamically from existing jobs
  const locations = useMemo(() => {
    if (!jobs) return [];
    return Array.from(new Set(jobs.map((j) => j.location).filter(Boolean))) as string[];
  }, [jobs]);

  const departments = useMemo(() => {
    if (!jobs) return [];
    return Array.from(new Set(jobs.map((j) => j.department).filter(Boolean))) as string[];
  }, [jobs]);

  const employmentTypes = useMemo(() => {
    if (!jobs) return [];
    return Array.from(new Set(jobs.map((j) => j.employment_type).filter(Boolean))) as string[];
  }, [jobs]);

  // Apply filters
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter((job) => {
      const matchesTitle = searchTitle
        ? job.title.toLowerCase().includes(searchTitle.toLowerCase())
        : true;
      const matchesLocation =
        selectedLocation === "all" ? true : job.location === selectedLocation;
      const matchesDepartment =
        selectedDepartment === "all" ? true : job.department === selectedDepartment;
      const matchesEmpType =
        selectedEmpType === "all" ? true : job.employment_type === selectedEmpType;

      return matchesTitle && matchesLocation && matchesDepartment && matchesEmpType;
    });
  }, [jobs, searchTitle, selectedLocation, selectedDepartment, selectedEmpType]);

  const isFiltered = searchTitle || selectedLocation !== "all" || selectedDepartment !== "all" || selectedEmpType !== "all";

  return (
    <div className="min-h-svh flex flex-col bg-muted/30">
      <SiteHeader user={user} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Tất cả việc làm</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Các vị trí đang tuyển. Chọn tin để xem chi tiết và ứng tuyển.
          </p>
        </div>

        {/* Filter bar */}
        {!isLoading && !isError && jobs && jobs.length > 0 && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="flex h-9 w-full rounded-3xl border border-transparent bg-input/50 px-4 py-2 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 data-placeholder:text-muted-foreground dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
            />

            {/* Location Select */}
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Địa điểm" />
              </SelectTrigger>
              <SelectContent position="popper" className="w-full">
                <SelectItem value="all">Tất cả địa điểm</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Department Select */}
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Phòng ban" />
              </SelectTrigger>
              <SelectContent position="popper" className="w-full">
                <SelectItem value="all">Tất cả phòng ban</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Employment Type Select */}
            <Select value={selectedEmpType} onValueChange={setSelectedEmpType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Loại công việc" />
              </SelectTrigger>
              <SelectContent position="popper" className="w-full">
                <SelectItem value="all">Tất cả hình thức</SelectItem>
                {employmentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {employmentTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Reset Button */}
            <Button
              variant="outline"
              onClick={resetFilters}
              disabled={!isFiltered}
              className="rounded-3xl"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 size-4"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Xóa bộ lọc
            </Button>
          </div>
        )}

        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Đang tải...</p>
        ) : isError ? (
          <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-destructive">
            Không thể tải danh sách việc làm. Vui lòng thử lại.
          </p>
        ) : !jobs || jobs.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-muted-foreground">
            Hiện chưa có tin tuyển dụng đang hoạt động.
          </p>
        ) : filteredJobs.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-muted-foreground">
            Không tìm thấy việc làm phù hợp với bộ lọc.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <li key={job.id}>
                <JobCardPreview {...job} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
