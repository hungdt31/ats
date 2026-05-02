"use client";

import Link from "next/link";
import { UserNav } from "@/components/auth/user-nav";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import type { PublicUser } from "@/types/api";

type SiteHeaderProps = {
  /** User đã đăng nhập — null/undefined khi chưa login. */
  user?: PublicUser | null;
};

/**
 * Header chung cho các trang public (landing, jobs, job detail…).
 *
 * - Nhận `user` qua props — caller tự lấy từ `useMe()` (client) hoặc `getSession()` (server).
 */
export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Logo />

        {/* Nav: avatar hoặc nút login/register */}
        <nav className="flex flex-wrap items-center gap-2">
          {user ? (
            <UserNav email={user.email} fullName={user.fullName} role={user.role} />
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
  );
}
