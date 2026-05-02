import type { UserRole } from "@prisma/client";

/** Đích điều hướng sau đăng nhập theo yêu cầu RBAC. */
export function getPostLoginPath(role: UserRole): string {
  return role === "candidate" ? "/candidate" : "/dashboard";
}
