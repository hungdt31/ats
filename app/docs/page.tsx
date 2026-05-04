"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01FreeIcons } from "@hugeicons/core-free-icons";
import { AuthDocs } from "@/components/docs/auth-docs";
import { PublicJobsDocs } from "@/components/docs/public-jobs-docs";
import { CandidateDocs } from "@/components/docs/candidate-docs";
import { AdminDocs } from "@/components/docs/admin-docs";
import { DbDocs } from "@/components/docs/db-docs";

const MODULES = [
  {
    id: "auth",
    name: "Module Xác thực & Tài khoản",
    description: "Đăng nhập, đăng ký, đăng xuất, profile, đổi mật khẩu.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>
    ),
  },
  {
    id: "candidate",
    name: "Module Dành cho Ứng viên",
    description: "Quản lý Hồ sơ, CV/Tài liệu, Đơn ứng tuyển và Lịch phỏng vấn.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41c-.155-2.126-.322-4.248-.492-6.347m-15.482 0a48.184 48.184 0 0 1 15.482 0m-15.482 0L12 3.306l8.231 4.544-1.646 2.3m-13.169 0 1.646 2.3m11.523-2.3v3.311a12.075 12.075 0 0 1-2.017 6.894"
        />
      </svg>
    ),
  },
  {
    id: "jobs",
    name: "Cổng thông tin Tuyển dụng (Public Jobs)",
    description: "Xem danh sách tin, xem chi tiết tin tuyển dụng và nộp đơn.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 14.15v4.25c0 .594-.406 1.125-1 1.125H4.75c-.594 0-1-.531-1-1.125v-4.25m16.5 0c0-.594-.406-1.125-1-1.125H4.75c-.594 0-1 .531-1 1.125m16.5 0V9.75c0-.594-.406-1.125-1-1.125H4.75c-.594 0-1 .531-1 1.125V14.15M12 3v5.25"
        />
      </svg>
    ),
  },
  {
    id: "admin",
    name: "Quản trị viên & Nhân sự (Admin)",
    description: "Tổng quan, Quản lý Tin tuyển dụng, Đơn ứng tuyển, Phỏng vấn, Email.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      </svg>
    ),
  },
];

const SYSTEM_MODULES = [
  {
    id: "db",
    name: "Cơ sở dữ liệu (Tables)",
    description: "Các bảng trong hệ thống, cấu trúc dữ liệu và liên kết.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75M3.75 13.875v3.75"
        />
      </svg>
    ),
  },
];

export default function DocsPage() {
  const [activeModuleId, setActiveModuleId] = useState(MODULES[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const allModules = [...MODULES, ...SYSTEM_MODULES];
  const activeModule = allModules.find((m) => m.id === activeModuleId) || MODULES[0];

  const handleSelectModule = (id: string) => {
    setActiveModuleId(id);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-muted/20 text-foreground relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Docs Sidebar (Desktop + Mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 border-r bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col shrink-0 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold tracking-tight text-primary">
              Tài Liệu Thiết Kế
            </span>
          </div>
          {/* Close button on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Các Modules
            </div>
            <div className="space-y-1">
              {MODULES.map((mod) => {
                const isActive = activeModuleId === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => handleSelectModule(mod.id)}
                    className={`flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition-all ${isActive
                      ? "bg-primary/10 font-medium border border-primary/20 shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                  >
                    <div className={`mt-0.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/70"}`}>
                      {mod.icon}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold">{mod.name}</span>
                      <span className="text-xs leading-relaxed opacity-90 font-normal">
                        {mod.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Hệ thống
            </div>
            <div className="space-y-1">
              {SYSTEM_MODULES.map((mod) => {
                const isActive = activeModuleId === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => handleSelectModule(mod.id)}
                    className={`flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition-all ${isActive
                      ? "bg-primary/10 font-medium border border-primary/20 shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                  >
                    <div className={`mt-0.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/70"}`}>
                      {mod.icon}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold">{mod.name}</span>
                      <span className="text-xs leading-relaxed opacity-90 font-normal">
                        {mod.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t p-4 flex items-center justify-between bg-muted/10">
          <Link
            href="/"
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <HugeiconsIcon icon={ArrowLeft01FreeIcons} className="size-3" /> Về trang chủ
          </Link>
          <span className="text-xs font-mono text-muted-foreground">v1.0.0</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between md:justify-start gap-2">
              <Badge variant="secondary" className="text-xs font-normal px-2.5 py-0.5">
                Technical Blueprint
              </Badge>
              {/* Hamburger Button on Mobile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </Button>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {activeModule.name}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
                {activeModule.description}
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {activeModuleId === "auth" && <AuthDocs />}
            {activeModuleId === "candidate" && <CandidateDocs />}
            {activeModuleId === "jobs" && <PublicJobsDocs />}
            {activeModuleId === "admin" && <AdminDocs />}
            {activeModuleId === "db" && <DbDocs />}
          </div>
        </div>
      </main>
    </div>
  );
}
