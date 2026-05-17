import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { employmentTypeLabel, formatSalaryRange } from "@/lib/data/jobs-utils";
import { Badge } from "../ui/badge";

type JobCardProps = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  department: string | null;
  category: string | null;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  expires_at?: string | Date | null;
  headcount?: number | null;
};

/** Thẻ tin tuyển dụng (landing / danh sách). */
export function JobCardPreview({
  slug,
  title,
  location,
  department,
  category,
  employment_type,
  salary_min,
  salary_max,
  expires_at,
  headcount,
}: JobCardProps) {
  const salary = formatSalaryRange(salary_min, salary_max);
  const expiresDate = expires_at ? new Date(expires_at).toLocaleDateString("vi-VN") : null;

  return (
    <Link href={`/jobs/${slug}`} className="group block h-full transition-opacity hover:opacity-95">
      <Card className="h-full min-h-44 border-border/80 shadow-md transition-shadow group-hover:shadow-lg flex flex-col justify-between">
        <CardHeader className="gap-2 pb-3">
          <CardTitle className="line-clamp-2 text-base leading-snug">
            {title}
          </CardTitle>
          <div className="w-10 h-1 bg-primary"></div>
          <CardDescription className="text-xs flex flex-wrap items-center justify-between gap-1 text-muted-foreground mt-0.5">
            <span>Hạn nộp: <span className="font-medium text-foreground">{expiresDate ? expiresDate : "Không có"}</span></span>
          </CardDescription>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-muted-foreground mt-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 flex-shrink-0 text-muted-foreground"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span className="truncate" title={employmentTypeLabel(employment_type)}>{employmentTypeLabel(employment_type)}</span>
            </div>

            {department && (
              <div className="flex items-center gap-1.5 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 flex-shrink-0 text-muted-foreground"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="12"></line><line x1="15" y1="22" x2="15" y2="12"></line><line x1="12" y1="6" x2="12" y2="6"></line><line x1="12" y1="10" x2="12" y2="10"></line><line x1="12" y1="14" x2="12" y2="14"></line><line x1="12" y1="18" x2="12" y2="18"></line></svg>
                <span className="truncate" title={department}>{department}</span>
              </div>
            )}

            {category && (
              <div className="flex items-center gap-1.5 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 flex-shrink-0 text-muted-foreground"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                <span className="truncate" title={category}>{category}</span>
              </div>
            )}

            {location && (
              <div className="flex items-center gap-1.5 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 flex-shrink-0 text-muted-foreground"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span className="truncate" title={location}>{location}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="mt-auto pt-0 flex flex-wrap items-center justify-between gap-2">
          {salary ? (
            <p className="text-sm font-medium text-primary shrink-0">{salary}</p>
          ) : (
            <p className="text-sm text-muted-foreground shrink-0">Mức lương: thỏa thuận</p>
          )}
          {typeof headcount === "number" && (
            <Badge variant="secondary">
              Số lượng: <span className="font-medium text-foreground">{headcount}</span>
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
