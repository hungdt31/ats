import Link from "next/link";

import { ClientSiteHeader } from "@/components/layout/client-site-header";
import { JobCardPreview } from "@/components/landing/job-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getFeaturedJobs } from "@/lib/data/jobs";
import { getSession } from "@/lib/auth/session";

export const metadata = {
  title: "ATS | Tìm việc và quản lý tuyển dụng",
  description: "Khám phá việc làm phù hợp — nền tảng ATS cho doanh nghiệp và ứng viên.",
};

/** Trang chủ giới thiệu: hero, preview tin tuyển dụng, điều hướng theo trạng thái đăng nhập. */
export default async function HomePage() {
  const session = await getSession();
  const featuredJobs = await getFeaturedJobs(6);

  return (
    <div className="min-h-svh flex flex-col bg-muted/30">
      <ClientSiteHeader />

      <main className="flex flex-1 flex-col">
        <section className="border-b bg-gradient-to-br from-primary/10 via-muted/40 to-background px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
              Việc làm &amp; tuyển dụng
            </p>
            <h1 className="font-heading text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              Kết nối ứng viên với cơ hội đúng người, đúng thời điểm
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground md:text-lg">
              ATS là nền tảng tuyển dụng giúp ứng viên tìm việc, quản lý hồ sơ và theo dõi quy trình tuyển dụng — tối ưu cho cả ứng viên và đội HR.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/jobs">Xem việc làm</Link>
              </Button>
              {!session ? (
                <Button size="lg" variant="outline" asChild>
                  <Link href="/register">Tạo tài khoản ứng viên</Link>
                </Button>
              ) : (
                <Button size="lg" variant="outline" asChild>
                  <Link href={session.user.role === "candidate" ? "/candidate" : "/dashboard"}>
                    Vào không gian của tôi
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight">Việc làm nổi bật</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Một số vị trí đang mở — cập nhật theo dữ liệu thật từ hệ thống.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/jobs">Xem tất cả</Link>
            </Button>
          </div>

          <Separator className="my-8" />

          {featuredJobs.length === 0 ? (
            <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-muted-foreground">
              Chưa có tin tuyển dụng đang hoạt động. HR có thể thêm tin trong dashboard sau khi module được bật.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.map((job) => (
                <li key={job.id}>
                  <JobCardPreview {...job} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="border-t bg-background py-8 text-center text-sm text-muted-foreground">
          <div className="mx-auto max-w-6xl px-4">
            <Link href="/jobs" className="underline-offset-4 hover:underline">
              Danh sách việc làm
            </Link>
            <span className="mx-2">·</span>
            {!session ? (
              <Link href="/login" className="underline-offset-4 hover:underline">
                Đăng nhập
              </Link>
            ) : (
              <span>Đã đăng nhập</span>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}
