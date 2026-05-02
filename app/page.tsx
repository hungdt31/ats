import Link from "next/link";

import { UserNav } from "@/components/auth/user-nav";
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
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="256"
              height="256"
              viewBox="0 0 256 256"
              fill="none"
              className="size-5"
            >
              <rect width="256" height="256" fill="none"></rect>

              <line
                x1="208"
                y1="128"
                x2="128"
                y2="208"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="32"
              ></line>

              <line
                x1="192"
                y1="40"
                x2="40"
                y2="192"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="32"
              ></line>
            </svg>
            <Link href="/" className="font-heading text-lg font-semibold tracking-tight">
              ATS
            </Link>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {session ? (
              <UserNav
                email={session.user.email}
                fullName={session.user.fullName}
                role={session.user.role}
              />
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Đăng ký</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

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
