"use client";

import { useState } from "react";

type Msg = { type: "success" | "error"; text: string };

export type UseChangePasswordReturn = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  isPending: boolean;
  msg: Msg | null;
  setCurrentPassword: (v: string) => void;
  setNewPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  clearMsg: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
};

/**
 * Quản lý form đổi mật khẩu khi đã đăng nhập.
 * Gọi POST /api/auth/password với currentPassword + newPassword.
 */
export function useChangePassword(): UseChangePasswordReturn {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (newPassword !== confirmPassword) {
      setMsg({ type: "error", text: "Xác nhận mật khẩu mới không khớp" });
      return;
    }

    setIsPending(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json() as { message?: string };
      if (!res.ok) {
        setMsg({ type: "error", text: data.message ?? "Không thể đổi mật khẩu" });
      } else {
        setMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setMsg({ type: "error", text: "Lỗi kết nối máy chủ khi đổi mật khẩu" });
    } finally {
      setIsPending(false);
    }
  }

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    isPending,
    msg,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    clearMsg: () => setMsg(null),
    handleSubmit,
  };
}
