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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useMe } from "@/hooks/use-me";
import { useLogout } from "@/hooks/use-auth";

type UserNavProps = {
  email?: string | null;
  fullName?: string | null;
  role?: UserRole;
  avatarUrl?: string | null;
};

const ROLE_LABEL: Record<UserRole, string> = {
  candidate: "Ứng viên",
  admin: "Quản trị",
  hr: "HR",
  interviewer: "Phỏng vấn viên",
};

/** Menu tài khoản — đăng xuất qua API (xoá cookie JWT). */
export function UserNav({ email, fullName, role, avatarUrl }: UserNavProps) {
  const router = useRouter();
  const { data: currentUser } = useMe();

  const activeEmail = currentUser?.email ?? email;
  const activeFullName = currentUser?.fullName ?? fullName;
  const activeRole = currentUser?.role ?? role;
  const activeAvatarUrl = currentUser?.avatarUrl ?? avatarUrl;

  const label = activeFullName || activeEmail || "Tài khoản";

  const handleNavSpace = useCallback(() => {
    if (activeRole === "candidate") {
      router.push("/candidate");
    } else {
      router.push("/dashboard");
    }
  }, [activeRole, router]);

  const { mutate: logout } = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative flex items-center gap-2 h-9 rounded-full px-2">
          <Avatar className="h-7 w-7">
            {activeAvatarUrl ? (
              <AvatarImage
                src={activeAvatarUrl}
                alt={activeFullName || ""}
              />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                {(activeFullName || activeEmail || "T").charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="max-w-28 truncate font-normal text-sm hidden md:inline">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56 rounded-xl">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{label}</span>
            {activeEmail ? <span className="text-xs text-muted-foreground">{activeEmail}</span> : null}
            {activeRole ? (
              <span className="text-xs text-muted-foreground">Vai trò: {ROLE_LABEL[activeRole]}</span>
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
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => logout()}>
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
