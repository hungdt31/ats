"use client";

import { useCallback } from "react";

import type { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

type UserNavProps = {
  email?: string | null;
  fullName?: string | null;
  role?: UserRole;
};

const ROLE_LABEL: Record<UserRole, string> = {
  candidate: "Ứng viên",
  admin: "Quản trị",
  hr: "HR",
  interviewer: "Phỏng vấn viên",
};

/** Menu tài khoản — đăng xuất qua API (xoá cookie JWT). */
export function UserNav({ email, fullName, role }: UserNavProps) {
  const router = useRouter();
  const label = fullName || email || "Tài khoản";

  const handleNavSpace = useCallback(() => {
    if (role === "candidate") {
      router.push("/candidate");
    } else {
      router.push("/dashboard");
    }
  }, [role, router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative flex items-center gap-2 h-9 rounded-full px-2">
          <Avatar className="h-7 w-7">
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt="@shadcn"
              className="grayscale"
            />
          </Avatar>
          <span className="max-w-28 truncate font-normal text-sm hidden md:inline">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56 rounded-xl">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{label}</span>
            {email ? <span className="text-xs text-muted-foreground">{email}</span> : null}
            {role ? (
              <span className="text-xs text-muted-foreground">Vai trò: {ROLE_LABEL[role]}</span>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          onClick={handleNavSpace}
        >
          Không gian cá nhân
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => void handleLogout()}>
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
