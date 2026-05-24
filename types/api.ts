import type { UserRole } from "@prisma/client";

/** User an toàn cho client (không có password). */
export type PublicUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string | null;
  avatarUrl?: string | null;
};

export type ApiSuccess<T> = { success: true; data: T };

export type ApiErrorBody = {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
};

export type MeResponse = ApiSuccess<{ user: PublicUser }>;
